var GITHUB_API = 'https:\/\/api\.github\.com'
var exec = require('child_process').exec

var api = [GITHUB_API, 'repos', 'luckydrq', ''].join('\/')

exec(['curl ', GITHUB_API, ''])