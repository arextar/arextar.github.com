;(function (sync) {
  var wrench = this.wrench = new Worker(self)
  
  var uid = 1, __slice = [].slice
  
  function Worker (worker) {
    var that = this
    this.worker = worker
    this.events = {}
    this.fns = {}
    worker.onmessage = function (e) {
      that._handleMessage(e.data)
    }
  }
  
  function makeRemoteFunction (id, worker) {
    return function () {
      worker.emit('__call', id, __slice.call(arguments))
    }
  }
  
  Worker.prototype._decodeArgs = function (args) {
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'string' && /^__wrenchFunction/.test(args[i])) {
        args[i] = makeRemoteFunction(args[i], this)
      }
    }
    return args
  }
  
  Worker.prototype._encodeArgs = function (args) {
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'function') {
        var id = '__wrenchFunction' + (uid++)
        this.fns[id] = args[i]
        args[i] = id
      }
    }
    return args
  }
  
  Worker.prototype._handleMessage = function (data) {
    if (typeof data === 'string') data = JSON.parse(data)
    if (data.type === '__call') {
      this.fns[data.args[0]].apply(this, data.args[1])
      return;
    }
    if (data.type === '__log') {
      if (window.console) console.log.apply(console, data.args)
      return;
    }
    
    var handlers = this.events[data.type]
    if (!handlers) return
    var args = this._decodeArgs(data.args)
    
    if (typeof handlers === 'function') return handlers.apply(this, args)
    for (var i = 0; i < handlers.length; i++) handlers[i].apply(this,  args)
  }
  
  Worker.prototype.emit = function (type, a, b) {
    var len = arguments.length
    this.worker.postMessage({type: type, args: len < 2 ? [] : this._encodeArgs(len < 3 ? [a] : len < 4 ? [a, b] : __slice.call(arguments, 1))})
  }
  
  Worker.prototype.on = function (type, fn) {
    var events = this.events, cur = typeof events[type]
    if (cur === 'undefined') events[type] = fn
    else if (cur === 'function') events[type] = [events[type], fn]
    else events[type].push(fn)
  }
  
  Worker.prototype.log = function (a, b) {
    var len = arguments.length
    this.worker.postMessage({type: '__log', args: len < 1 ? [] : len < 2 ? [a] : len < 3 ? [a, b] : __slice.call(arguments)})
  }
  
  // Utility functions
  var __bind = Function.prototype.bind || function (context, a, b) {
    var fn = this, len = arguments.length, args = len < 2 ? [] : len < 3 ? [a] : len < 4 ? [a, b] : __slice.call(arguments, 1)
    return function () {
      fn.apply(context, args.concat(__slice.call(arguments)))
    }
  }
  
  wrench.each = function (array, each, callback) {
    if (sync) {
      for (var i = 0; i < array.length; i++) each(array[i], i, array)
      if (callback) callback()
    }
    else
    {
      for (var i = 0; i < array.length; i++) setTimeout(__bind.call(each, null, array[i], i, array), 1)
      if (callback) setTimeout(callback, 1)
    }
  }
  
  wrench.eachAsync = function (array, each, callback) {
    if (sync) {
      for (var i = 0, done = 1; i < array.length; i++) each(array[i], function () {
        done++
        if (done === array.length) callback()
      }, i, array)
    }
    else
    {
      for (var i = 0, done = 1; i < array.length; i++) setTimeout(__bind.call(each, null, array[i], function () {
        done++
        if (done === array.length) callback()
      }, i, array), 1)
    }
  }
  
  wrench.filter = function (array, filter, callback) {
    var ret = [], i = 0
    wrench.each(array, function (value, index) {
      if (filter(value, index, array)) ret[i++] = value
    }, function () {
      if (callback) callback(ret)
    })
  }
  
  wrench.map = function (array, map, callback) {
    var ret = []
    wrench.each(array, function (value, index) {
      ret[index] = map(value, index, array)
    }, function () {
      if (callback) callback(ret)
    })
  }
  
  wrench.get = function (url, type, callback) {
    if (typeof type === 'function') {
      callback = type
      type = 'text'
    }
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var res = xhr.responseText
        xhr = null
        if (type === 'json') res = JSON.parse(res)
        callback(res)
      }
    }
    xhr.send()
  }
}(typeof window === 'undefined'))