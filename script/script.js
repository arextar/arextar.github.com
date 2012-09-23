;(function () {
  var search = document.getElementById('search')
  var results = document.getElementById('results')
  var search_input = search.firstChild
  var loading = search.childNodes[1]
  var search_worker = wrench.init('script/search.min.js')
  var old_value
  
  loading.style.visibility = 'hidden'
  
  search_worker.on('populate', function (post) {
    var div = document.createElement('div')
    div.className = 'result'
    div.innerHTML = '<h4><a href=/' + post.id + '.html>' + post.title + '</a></h4><p>' + post.snip + '...</p>'
    results.appendChild(div)
  })
  
  search_worker.on('done', function () {
    loading.style.visibility = 'hidden'
  })
  
  search_input.onkeyup = function () {
    if (search_input.value !== old_value && search_input.value) {
      loading.style.visibility = ''
      results.innerHTML = ''
      search_worker.emit('search', old_value = search_input.value)
    }
  }
  
  var images = document.getElementsByTagName('img')
  
  function check_images () {
    for (var i = 0, img; img = images[i++]; ) {
      if (!img.src && img.offsetTop + img.offsetHeight / 2 < scrollY + innerHeight) {
        img.src = img.getAttribute('data-src')
        img.removeAttribute('data-src')
      }
    }
  }
  
  setTimeout(function () {
    check_images()
    window.onscroll = check_images
  }, 100)
}())