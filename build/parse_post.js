var marked = require('marked')
var async = require('async')
var im = require('imagemagick');
var cp = require('child_process')
var http = require('http')
var fs = require('fs')
var posts = exports.posts = {}
var img_data = JSON.parse(fs.readFileSync(__dirname + '/../images/data.json', 'utf8'))
var ext = {
  GIF: 'gif',
  JPEG: 'jpg',
  PNG: 'png'
}

marked.setOptions({
  gfm: true
})

function parse_meta (str) {
  var ret = {}
  str.split('\n').forEach(function (pair) {
    pair = pair.split(/\s*:\s*/)
    ret[pair[0]] = pair[1]
  })
  return ret
}

function optimize (item, callback) {
  var url = item.url
  if (img_data.hasOwnProperty(url)) {
    item.fname = img_data[url].fname
    item.width = img_data[url].width
    item.height = img_data[url].height
    callback()
    return;
  }
  
  console.log('GET', url)
  http.get(url, function (res) {
    var _name = __dirname + '/temp_img' + img_data.uid
    var stream = fs.createWriteStream(_name)
    res.pipe(stream)
    
    res.on('end', function () {
      im.identify(_name, function(err, features){
        var img = 'image' + (img_data.uid++) + '.' + ext[features.format]
        var read = fs.createReadStream(_name)
        
        if (features.format === 'GIF') {
          var optim = cp.spawn('gifsicle', ['-O'])
          read.pipe(optim.stdin)
          optim.stdout.pipe(fs.createWriteStream(__dirname + '/../images/' + img))
        }
        else if (features.format === 'PNG') {
          read.pipe(fs.createWriteStream(__dirname + '/../images/' + img))
          cp.spawn('optipng', ['-o7', __dirname + '/../images/' + img])
        }
        
        read.on('end', function () {
          fs.unlink(_name)
        })
        item.fname = img
        item.width = features.width
        item.height = features.height
        callback()
        img_data[url] = item
        fs.writeFileSync(__dirname + '/../images/data.json', JSON.stringify(img_data))
      })
    })
  })
}

function parse (fname, blog, cb) {
  var txt = fs.readFileSync(fname, 'utf8')
  txt = txt.split('\n\n')
  var meta = parse_meta(txt.shift()), images = []
  txt = txt.join('\n\n')
  
  txt.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, function (_, alt, url) {
    images.push({alt: alt, url: url})
  })
  
  async.forEach(images, optimize, function () {
    var i = 0
     txt = txt.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, function (_, alt, url) {
      var item = images[i++]
      return '<div class=center style=width:' + item.width + 'px;height:' + (item.height + 40) + 'px>\
<img data-src=/images/' + item.fname + ' width=' + item.width + ' height=' + item.height + '><p class=caption>' + alt + '</p>\
</div>'
    })
     
     txt = txt.split('\n---\n')
    var peek = txt[0].split('<blurb>')
    cb(null, {
      id: /([\w_-]+)\.\w+$/.exec(fname)[1],
      meta: meta,
      blurb: peek[0],
      peek: marked(peek[0] + (peek[1] || '')),
      full: marked(peek[0] + (peek[1] || '') + '\n' + (txt[1] || ''))
    })
  })
}

exports.parse = parse