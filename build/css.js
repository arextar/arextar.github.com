var fs = require('fs')

exports.run = function () {
	fs.readFile(__dirname + '/../style/style.css', 'utf8', function (err, style) {
	  fs.writeFile(__dirname + '/../style/style.min.css',
	    style.replace(/\s*([;:\{\}])\s*/g, '$1')
	  )
	})

	fs.readFile(__dirname + '/../style/style.big.css', 'utf8', function (err, style) {
	  fs.writeFile(__dirname + '/../style/style.big.min.css',
	    style.replace(/\s*([;:\{\}])\s*/g, '$1')
	  )
	})
}