var jade = require('jade')
var compile_posts = require('./compile_posts')
var fs = require('fs')
var tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/layout.jade', 'utf8'), {filename: __dirname + '/../templates/layout.jade'})
var post_tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/post.jade', 'utf8'))
var blog = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'))

blog.links.reverse()

var posts = __dirname + '/../posts/'


exports.run = function () {
  fs.readFile('post-data.json', function (err, data) {
    var posts = JSON.parse(data)

    posts.forEach(function (post) {
      console.log('Saving post ' + post.id + '...')
      fs.writeFile(__dirname + '/../post/' + post.id + '.html', tmpl({full: true, blog: blog, posts: [post]}))
    })
    
    fs.writeFile(__dirname + '/../index.html', tmpl({full: false, blog: blog, posts: posts}))
    
    fs.writeFile(__dirname + '/../data/search.json', JSON.stringify(compile_posts.searchable(posts)))
  })

  fs.readFile('page-data.json', function (err, data) {
    var pages = JSON.parse(data)

    pages.forEach(function (page) {
      console.log('Saving page ' + page.id + '...')
      fs.writeFile(__dirname + '/../page/' + page.id + '.html', tmpl({full: true, blog: blog, posts: [page]}))
    })
  })
}

exports.watch = function () {
  fs.watch(__dirname + '/../templates/layout.jade', function (err) {
    tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/layout.jade', 'utf8'), {filename: __dirname + '/../templates/layout.jade'})
    run('views')
  })

  fs.watch(__dirname + '/../templates/post.jade', function (err) {
    post_tmpl = jade.compile(fs.readFileSync(__dirname + '/../templates/post.jade', 'utf8'))
    run('views')
  })

  fs.watch(__dirname + '/../data.json', function (err) {
    blog = JSON.parse(fs.readFileSync(__dirname + '/../data.json', 'utf8'))
    blog.links.reverse()
    run('views')
  })
}