//external lib
var toss = require('cool-error')
var request = require('request')

var GITHUB_API = 'https://api.github.com/'
var exec = require('child_process').exec
var api = [GITHUB_API, 'repos', 'luckydrq', ''].join('\/')

var options = {
  url: GITHUB_API + 'repos/luckydrq/github-api-test/git/refs/heads/master',
  headers: {
    'Accept': 'application/vnd.github.v3+json;q=0.9, application/json, */*;q=0.8',
    'User-Agent': 'luckydrq'
  }
}
request(options, function(err, res, body){
  if(err) toss(err)
  if(res.statusCode !== 200) toss({statusCode: res.statusCode}, true)
  console.log(body)
})

process.on('uncaughtException', function(ex){
  //console.log(ex.message)
  process.exit(1)
})

//exec(['curl ', GITHUB_API, ''])