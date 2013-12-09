var fs = require('fs')
var path = require('path')

//external lib
var async = require('async')
var toss = require('cool-error')
var GitHubApi = require('github')

//github api
var github = new GitHubApi({
  version: '3.0.0',
  debug: true,
  protocol: 'https'
})

var config = require('./temp.json')
var username = config.username
var password = config.password
var repo = config.repo
var file = config.file

var data = {
  FILE_CONTENT: fs.readFileSync(path.join(__dirname, file), {encoding: 'utf-8'})
}
//console.log(data.FILE_CONTENT)
async.waterfall([
  //authenticate
  function(cb){
    writeLog('authenticating...')
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

  //get => SHA_LASTEST_COMMIT
  function(cb){
    writeResult('success')
    writeLog('fetch SHA_LASTEST_COMMIT...')
    github.gitdata.getReference({
      user: 'thx',
      repo: repo,
      ref: 'heads/master'
    }, function(err, result){
      var sha_last_commit = data.SHA_LASTEST_COMMIT = result.object.sha
      writeResult(sha_last_commit)
      cb(err, data)
    })
  },

  //get => SHA_BASE_TREE
  function(data, cb){
    writeLog('fetch SHA_BASE_TREE...')
    github.gitdata.getCommit({
      user: 'thx',
      repo: repo,
      sha: data.SHA_LASTEST_COMMIT
    }, function(err, result){
      var sha_base_tree = data.SHA_BASE_TREE = result.tree.sha
      writeResult(sha_base_tree)
      cb(err, data)
    })
  },

  //post => SHA_NEW_BLOB
  function(data, cb){
    writeLog('fetch SHA_NEW_BLOB...')
    github.gitdata.createBlob({
      user: 'thx',
      repo: repo,
      content: data.FILE_CONTENT || '\/\/file content cannot be empty',
      encoding: 'utf-8'
    }, function(err, result){
      var sha_new_blob = data.SHA_NEW_BLOB = result.sha
      writeResult(sha_new_blob)
      cb(err, data)
    })
  },

  //post => SHA_NEW_TREE
  function(data, cb){
    writeLog('fetch SHA_NEW_TREE...')
    github.gitdata.createTree({
      user: 'thx',
      repo: repo,
      tree: [{
        path: file,
        type: 'blob',
        mode: '100644',
        sha: data.SHA_NEW_BLOB
      }],
      base_tree: data.SHA_BASE_TREE
    }, function(err, result){
      var sha_new_tree = data.SHA_NEW_TREE = result.sha
      writeResult(sha_new_tree)
      cb(err, data)
    })
  },

  //post => SHA_NEW_COMMIT
  function(data, cb){
    writeLog('fetch SHA_NEW_COMMIT...')
    github.gitdata.createCommit({
      user: 'thx',
      repo: repo,
      message: 'commit via github api',
      tree: data.SHA_NEW_TREE,
      parents: [data.SHA_LASTEST_COMMIT]
    }, function(err, result){
      var sha_new_commit = data.SHA_NEW_COMMIT = result.sha
      writeResult(sha_new_commit)
      cb(err, data)
    })
  },

  //post => new reference
  function(data, cb){
    writeLog('push commit...')
    github.gitdata.updateReference({
      user: 'thx',
      repo: repo,
      ref: 'heads/master',
      sha: data.SHA_NEW_COMMIT,
      force: true
    }, function(err, result){
      if(err){
        cb(err)
      }
      else{
        writeResult('success')
      }
    })
  }

  ], function(err, results){
    if(err) toss(err)
  })

process.on('uncaughtException', function(ex){
  console.log(ex.message.red)
  process.exit(1)
})

function writeLog(msg){
  process.stdout.write(msg)
}
function writeResult(result){
  process.stdout.write([result, '\n'].join())
}