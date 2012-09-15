var parse_post = require('./parse_post')
var async = require('async')
var compile_posts = require('./compile_posts')
var jade = require('jade')
var fs = require('fs')
var tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/layout.jade', 'utf8'), {filename: __dirname + '/../templates/layout.jade'})
var post_tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/post.jade', 'utf8'))
var blog = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'))

blog.links.reverse()

var posts = __dirname + '/../posts/'

fs.readdir(posts, function (err, dir) {
  async.forEach(dir, function (fname, cb) {
    parse_post.parse(posts + fname, blog, cb)
  }, function () {
    var sorted_posts = compile_posts.sorted_posts(parse_post.posts)
    
    
    sorted_posts.forEach(function (post) {
      console.log('saving ' + post.id + '...')
      fs.writeFile(__dirname + '/../' + post.id + '.html', tmpl({full: true, blog: blog, posts: [post]}))
    })
    
    fs.writeFile(__dirname + '/../index.html', tmpl({full: false, blog: blog, posts: sorted_posts}))
    
    fs.writeFile(__dirname + '/../data/search.json', JSON.stringify(compile_posts.searchable(sorted_posts)))
  })
})

fs.readFile(__dirname + '/../style/style.css', 'utf8', function (err, style) {
  console.log('compressing style...')
  fs.writeFile(__dirname + '/../style/style.min.css',
    style.replace(/\s*([;:\{\}])\s*/g, '$1')
  )
})