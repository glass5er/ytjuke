
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var histories = new Array();
var max_histories = 10;

// postgresql
var pg = require('pg');
var dbName = "ytplaydb";
var baseTableName = "ytplaytable";

var connectionString = "tcp://pgsqladmin:sqladmin@127.0.0.1:5432/" + dbName;
pg.connect(connectionString, function(err, client) {
  client.query("SELECT tablename from pg_tables where tablename like '" + baseTableName + "'", function(err, result) {
    console.log("Row count: " + result.rows.length);
  });
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//  Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'YouTube Auto Playlist',
    video_id: 'RMfApWLG-OQ'
  });
});

//  receive request
app.get('/createTable', function(req, res){
  var queryTableName = req.query.key;
  var allTables = new Array();
  pg.connect(connectionString, function(err, client) {
    //  create new table  //
    client.query("create table if not exists ytp_" + queryTableName + "(yt_key char(7) PRIMARY KEY, title text)", function(err, result) {
      if(err) { console.log(err); }
    });
    //  get all tables  //
    client.query("select tablename from pg_tables where tablename like 'ytp_%'", function(err, result) {
      if(err) { console.log(err); }
      else {
        for(var i in result.rows) {
          var str = "" + result.rows[i].tablename;
          console.log("get: " + str);
          allTables.push(str.replace("ytp_",""));
        }
      }
      done();
    });
  });

  var resParams;
  var done = function() {
    resParams = {
      playlists: allTables
    };
    console.log("send parameters");
    res.send(resParams);
  };
});

app.get('/dropTable', function(req, res){
  pg.connect(connectionString, function(err, client) {
    client.query("drop table if exists ytp_" + tableName, function(err, result) {
    });
  });
  res.send();
});

app.get('/getElements', function(req, res){
  pg.connect(connectionString, function(err, client) {
    client.query("select * from ytp_" + tableName, function(err, result) {
    });
  });
  res.send();
});

app.get('/addElements', function(req, res){
  pg.connect(connectionString, function(err, client) {
    client.query("insert into ytp_" + tableName + "(yt_key) values " , function(err, result) {
    });
  });
  res.send();
});

app.get('/history', function(req, res){
  console.log('add history');
  var key = req.query.key;
  var alreadyExists = 0;
  if(key.length > 0){
    for(var i in histories) {
      if(histories[i] == key) { alreadyExists = 1; }
    };
  }else { alreadyExists = 1; }
  //  no same key exists -> add  //
  if(alreadyExists == 0) histories.push(key);
  if(histories.length > max_histories) histories.shift();
  //  response data  //
  var resParams = {
    hists: histories
  };
  console.log('length = ' + histories.length);
  res.send(resParams);
});

app.get('/clear', function(req, res){
  console.log('clear history');
  //  clear (auto GC)  //
  histories.length = 0;
  console.log('length = ' + histories.length);
  res.send();
});



var port = process.env.PORT || 48388;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
