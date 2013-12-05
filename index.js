//external lib
var async = require('async')
var toss = require('cool-error')
var request = require('request')
var GitHubApi = require('github')


var github = new GitHubApi({
  version: '3.0.0',
  debug: false,
  protocol: 'https'
})

var username = 'luckydrq'
var password = 'xxxx'
var repo = 'github-api-test'

async.waterfall([
  //authenticate
  function(cb){
    var ex = null
    try{
      github.authenticate({
        type: 'basic',
        username: username,
        password: password
      })
    }
    catch(exception){
      ex = exception
    }
    cb(ex)
  },

  //get SHA-LASTEST-COMMIT
  function(cb){
    github.gitdata.getReference({
      user: username,
      repo: repo,
      ref: 'heads/master'
    }, function(err, result){
      cb(err, result)
    })
  },

  //get SHA-BASE-TREE
  function(ref, cb){
    var sha = ref.object.sha
    github.gitdata.getCommit({
      user: username,
      repo: repo,
      sha: sha
    }, function(err, result){
      cb(err, result)
    })
  },

  ], function(err, results){
    //console.log(results)
    if(err) toss(err)
  })

process.on('uncaughtException', function(ex){
  console.log(ex.message.red)
  process.exit(1)
})

//exec(['curl ', GITHUB_API, ''])