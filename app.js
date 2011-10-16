
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var histories = new Array();
var max_histories = 10;

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
    title: 'Express',
		video_id: 'eM4wFhp7BRg'
  });
});

app.get('/history', function(req, res){
  console.log('add history');
  var key = req.query.key;
  var isin = 0;
  for(var i=0; i<histories.length; i++) {
    if(histories[i] == key) isin = 1;
  };
  if(isin == 0) histories.unshift(key);
  if(histories.length > max_histories) histories.pop();
  var reparams = {
    id: 'vS6wzjpCvec',
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
  var reparams = {
    id: 'vS6wzjpCvec',
  };
  console.log('length = ' + histories.length);
  res.send(reparams);
});

var port = process.env.PORT || 48388;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
