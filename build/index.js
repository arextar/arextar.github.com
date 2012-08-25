var parse_post = require('./parse_post')
var async = require('async')
var compile_posts = require('./compile_posts')
var jade = require('jade')
var fs = require('fs')
var tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/layout.jade', 'utf8'), {filename: __dirname + '/../templates/layout.jade'})
var post_tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/post.jade', 'utf8'))
var blog = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'))

var posts = __dirname + '/../posts/'

fs.readdir(posts, function (err, dir) {
  async.forEach(dir, function (fname, cb) {
    parse_post.parse(posts + fname, cb)
  }, function () {
    var sorted_posts = compile_posts.sorted_posts(parse_post.posts)
    
    blog.posts = sorted_posts
    
    sorted_posts.forEach(function (post) {
      fs.writeFile(__dirname + '/../posts/' + post.id + '.html', post_tmpl({full: true, post: post}))
    })
    
    fs.writeFile(__dirname + '/../index.html', tmpl({full: false, blog: blog}))
    
    fs.writeFile(__dirname + '/../data/search.json', JSON.stringify(compile_posts.searchable(sorted_posts)))
  })
})