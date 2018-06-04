var phantom = require('phantom');
var _ph, _page, _outObj;

const fs = require('fs');
const path = require('path');
const cors = require('cors');
var express = require('express'),
  app = express();
app.use(cors());
app.options('*', cors());

app.get('/', function(req, res){
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end('<video src="http://localhost:8888/small.mp4" controls></video>');
});

app.get('/small.mp4', function(req, res){
  
  var file = path.resolve(__dirname, "small.mp4");
  var readStream = fs.createReadStream(file);
  readStream.on('open', function () {
    readStream.pipe(res);
  });
  readStream.on('error', function(err) {
    res.end(err);
  });
});

var server = app.listen(8888, function() {
  var port = server.address().port;
  console.log('Express server listening on port %s', port);
});

// http.createServer(function (req, res) {
//
// }).listen(8888);

// http.createServer(function (req, res) {
//   var total;
//   if (reqResource == "/movie.mp4") {
//     total = movie_mp4.length;
//   }
//
//   var range = req.headers.range;
//   var positions = range.replace(/bytes=/, "").split("-");
//   var start = parseInt(positions[0], 10);
//   var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
//   var chunksize = (end - start) + 1;
//   movieStream = fs.createReadStream('./small.mp4');
//   movieStream.on('open', function () {
//     res.writeHead(206, {
//       "Content-Range": "bytes " + start + "-" + end + "/" + total,
//       "Accept-Ranges": "bytes",
//       "Content-Length": chunksize,
//       "Content-Type": "video/mp4"
//     });
//     // This just pipes the read stream to the response object (which goes
//     //to the client)
//     movieStream.pipe(res);
//   });
//
//   movieStream.on('error', function (err) {
//     res.end(err);
//   });
//
//   // phantom
//   //   .create()
//   //   .then(ph => {
//   //     _ph = ph;
//   //     return _ph.createPage();
//   //   })
//   //   .then(page => {
//   //     _page = page;
//   //     return _page.open('./index.html');
//   //   })
//   //   .then(status => {
//   //     console.log(status);
//   //     return _page.property('content');
//   //   })
//   //   .then(content => {
//   //     console.log(content);
//   //     _page.close();
//   //     _ph.exit();
//   //   })
//   //   .catch(e => console.log(e));
//
// }).listen(8888);


