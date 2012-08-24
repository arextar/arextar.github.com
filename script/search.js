importScripts('wrench/wrench.worker.js')

var posts = [
  {title: 'Title', snip: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent convallis'},
  {title: 'Test', snip: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent convallis'},
  {title: 'Also Test', snip: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent convallis'},
  {title: 'Aardvark', snip: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent convallis'}
]

wrench.on('search', function (query) {
  query = RegExp(query, 'i')
  wrench.each(posts, function (post) {
    if(query.test(post.title)) {
      wrench.emit('populate', post)
    }
  }, function () {
    wrench.emit('done')
  })
})