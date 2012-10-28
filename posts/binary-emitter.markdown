title: Binary emitter
date: _

I've been working on a [wrapper that turns binary streams into emitters](https://github.com/arextar/binary_emitter).<blurb>

#### Why?
I wanted something I could use in place of socket.io on the [Pine](https://github.com/jeremyckahn/pine) project. Because this project will need to be able to send events quickly from browser to node process to node process to browser, I needed something that would not need to parse and rewrite each event. I also wanted to use binary WebSockets because it seemed that they would be faster (and they have proven to be quite fast so far).

---

#### How?
Currently, the library works by keeping the names of the events paired with numbers, this assignment being sent tot he other end in a packet, to lessen the payload of event triggering. The sent JSON objects are encoded into a [Buffer]() or [TypedArray](https://developer.mozilla.org/en-US/docs/JavaScript_typed_arrays), depending on the environment it's taking place in; I'm still working on making the reading and writing of the objects faster and reliable, but it's working pretty well so far. WebSockets and node's native sockets are currently supported. See the project's [README]() for more information on its usage.

#### Future prospects
Like probably every project ever, this could use a nicer API and some code cleanup; however, I think it could definitely be useful in the future for projects that use WebSockets, and the object to Buffer/TypedArray parser could be pulled out and made useful in other places as a replacement for native JSON.