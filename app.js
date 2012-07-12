
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
var tableName = "ytplaytable";

var connectionString = "tcp://pgsqladmin:sqladmin@127.0.0.1:5432/" + dbName;
pg.connect(connectionString, function(err, client) {
  client.query("SELECT * from " + tableName, function(err, result) {
    console.log("Row count: " + result.rows.length);  // 1
    console.log("column_name: " + result.rows[0].column_name);
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

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'YouTube Auto Playlist',
		video_id: 'RMfApWLG-OQ'
  });
});

app.get('/history', function(req, res){
  console.log('add history');
  var key = req.query.key;
  var isin = 0;
  if(key.length > 0){
    for(var i=0; i<histories.length; i++) {
      if(histories[i] == key) isin = 1;
    };
  }else isin = 1;
  if(isin == 0) histories.push(key);
  if(histories.length > max_histories) histories.shift();
  var reparams = {
    hists: histories
  };
  console.log('length = ' + histories.length);
  res.send(reparams);
});

app.get('/clear', function(req, res){
  console.log('clear history');
  for(var i=0; i<histories.length; i++) {
    histories.pop();
  };
  console.log('length = ' + histories.length);
  res.send();
});

var port = process.env.PORT || 48388;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
