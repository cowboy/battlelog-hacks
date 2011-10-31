var http = require('http');
var fs = require('fs');

var port = 8000;
console.log("Starting webserver at http://localhost:" + port + "/");
console.log("\n(Close this window to exit)");

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/javascript'});
  res.end(fs.readFileSync('../dist/battlelog-hacks.js'));
}).listen(port);
