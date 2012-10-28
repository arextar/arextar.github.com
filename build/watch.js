var fs = require('fs')

exports.run = function () {
	require('./views').watch()
	require('./posts').watch()
}