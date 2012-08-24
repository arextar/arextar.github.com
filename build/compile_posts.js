exports.sorted_posts = function (posts) {
  var sorted_posts = []
  for (var x in posts) {
    posts[x].id = x
    sorted_posts.push(posts[x])
  }
  
  sorted_posts.sort(function (a, b) {
    return +new Date(b.meta.date) - +new Date(a.meta.date)
  })
  
  return sorted_posts
}