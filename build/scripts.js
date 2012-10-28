var fs = require('fs')
var uglify = require('uglify-js')

exports.run = function () {
	fs.readFile(__dirname + '/../script/wrench/wrench.js', 'utf8', function (err, wrench) {
		fs.readFile(__dirname + '/../script/script.js', 'utf8', function (err, script) {
		 	fs.writeFile(__dirname + '/../script/script.min.js', uglify(wrench + ';\n\n' + script))
		})
	})

	;['search', 'wrench/wrench.worker'].forEach(function (name) {
		fs.readFile(__dirname + '/../script/' + name + '.js', 'utf8', function (err, script) {
			fs.writeFile(__dirname + '/../script/' + name + '.min.js', uglify(script))
		})
	})
}