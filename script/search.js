importScripts('wrench/wrench.worker.js')

function Cache (options) {
  var cache = {}, timeouts = {}
  
  function expire (key) {
    if (options.timeout){
      clearTimeout(timeouts[key])
      timeouts[key] = setTimeout(function () {
        delete cache[key]
      }, options.timeout)
    }
  }
  
  function set (key, value) {
    expire(key)
    return cache[key] = value
  }
  
  function has (key) {
    return cache.hasOwnProperty(key)
  }
  
  return {
    get: function (key) {
      expire(key)
      return cache[key]
    },
    set: set,
    has: has,
    init: function (key, def) {
      expire(key)
      if (has(key)) return cache[key]
      return set(key, def)
    },
    initAsync: function (key, get, cb) {
      expire(key)
      if (has(key)) return cb(cache[key])
      get(function (val) {
        set(key, val)
        cb(val)
      })
    }
  }
}

var xhr_cache = new Cache({timeout: 6e4})

function get (src, type, fn) {
  if (typeof type === 'function') {
    fn = type
    type = 'text'
  }
  xhr_cache.initAsync(src, function (cb) {
    wrench.log(src)
    wrench.get(src, type, cb)
  }, fn)
}

wrench.on('search', function (query) {
  get('../data/search.json', 'json', function (posts) {
    query = RegExp(query, 'i')
    wrench.eachAsync(posts, function (post, cb) {
      if(query.test(post.title)) {
        wrench.emit('populate', post)
        cb()
      }
      else if (query.test(post.snip)) {
        wrench.emit('populate', post)
        cb()
      }
      else
      {
        get('../posts/' + post.id + '.markdown', function (txt) {
          if (query.test(txt)) wrench.emit('populate', post)
          cb()
        })
      }
    }, function () {
      wrench.emit('done')
    })
  })
})