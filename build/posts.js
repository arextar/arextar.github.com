var parse_post = require('./parse_post')
var async = require('async')
var fs = require('fs')
var posts = __dirname + '/../posts/'

exports.run = function (fn) {
  fs.readdir(posts, function (err, dir) {
    async.map(dir, function (fname, cb) {
      parse_post.parse(posts + fname, cb)
    }, function (err, sorted_posts) {
      sorted_posts.sort(function (a, b) {
        return +new Date(b.meta.date) - +new Date(a.meta.date)
      })
      fs.writeFile('post-data.json', JSON.stringify(sorted_posts), fn)
    })
  })

  fs.readdir(__dirname + '/../pages/', function (err, dir) {
    async.map(dir, function (fname, cb) {
      parse_post.parse(__dirname + '/../pages/' + fname, cb)
    }, function (err, pages) {
      fs.writeFile('page-data.json', JSON.stringify(pages), fn)
    })
  })
}

exports.watch = function () {
  fs.watch(__dirname + '/../posts', function (err) {
    run('posts')
  })
}