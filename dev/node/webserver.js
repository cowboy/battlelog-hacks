var http = require('http');
var files = require("./files.js");

var port = 8000;
console.log("Starting webserver at http://localhost:" + port + "/");
console.log("\n(Close this window to exit)");

http.createServer(function(req, res) {
  res.writeHead(200, {"Content-Type": "text/javascript"});
  res.end(files.concat());
}).listen(port);
