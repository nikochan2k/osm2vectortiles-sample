var express = require('express');
var http = require('http');
var app = express();
var path = require('path');


app.set('port', 7777);
app.use(express.static(path.join(__dirname, 'public')));

var tilelive = require('tilelive');
require('mbtiles').registerProtocols(tilelive);
var resolved = path.resolve("data/japan.mbtiles");
var mbtilesPath = 'mbtiles://' + resolved.replace(/\\/g, '/');
tilelive.load(mbtilesPath, function(err, source) {

  if (err) {
    throw err;
  }

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get(/^\/tiles\/(\d+)\/(\d+)\/(\d+).pbf$/, function(req, res) {

    var z = req.params[0];
    var x = req.params[1];
    var y = req.params[2];

    console.log('get tile %d, %d, %d', z, x, y);

    source.getTile(z, x, y, function(err, tile, headers) {
      if (err) {
        res.status(404)
        res.send(err.message);
        console.log(err.message);
      } else {
        res.set(headers);
        res.send(tile);
      }
    });
  });

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});
