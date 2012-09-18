var parse_post = require('./parse_post')
var async = require('async')
var compile_posts = require('./compile_posts')
var jade = require('jade')
var uglify = require('uglify-js')
var fs = require('fs')
var tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/layout.jade', 'utf8'), {filename: __dirname + '/../templates/layout.jade'})
var post_tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/post.jade', 'utf8'))
var blog = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'))

blog.links.reverse()

var posts = __dirname + '/../posts/'

fs.readdir(posts, function (err, dir) {
  async.map(dir, function (fname, cb) {
    parse_post.parse(posts + fname, blog, cb)
  }, function (err, sorted_posts) {
    sorted_posts.sort(function (a, b) {
      return +new Date(b.meta.date) - +new Date(a.meta.date)
    })
    
    sorted_posts.forEach(function (post) {
      console.log('saving post ' + post.id + '...')
      fs.writeFile(__dirname + '/../post/' + post.id + '.html', tmpl({full: true, blog: blog, posts: [post]}))
    })
    
    fs.writeFile(__dirname + '/../index.html', tmpl({full: false, blog: blog, posts: sorted_posts}))
    
    fs.writeFile(__dirname + '/../data/search.json', JSON.stringify(compile_posts.searchable(sorted_posts)))
    pages()
  })
})

function pages () {
  fs.readdir(__dirname + '/../pages/', function (err, dir) {
    async.map(dir, function (fname, cb) {
      parse_post.parse(__dirname + '/../pages/' + fname, blog, cb)
    }, function (err, pages) {
      pages.forEach(function (page) {
        console.log('saving page ' + page.id + '...')
        fs.writeFile(__dirname + '/../page/' + page.id + '.html', tmpl({full: true, blog: blog, posts: [page]}))
      })
      
    })
  })
}

fs.readFile(__dirname + '/../style/style.css', 'utf8', function (err, style) {
  fs.writeFile(__dirname + '/../style/style.min.css',
    style.replace(/\s*([;:\{\}])\s*/g, '$1')
  )
})

;['script', 'search', 'wrench/wrench', 'wrench/wrench.worker'].forEach(function (name) {
  fs.readFile(__dirname + '/../script/' + name + '.js', 'utf8', function (err, script) {
    fs.writeFile(__dirname + '/../script/' + name + '.min.js', uglify(script))
  })
})