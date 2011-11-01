var fs = require("fs");
var src = require("./files.js").concat();

fs.writeFileSync("../dist/battlelog-hacks.js", src, "UTF8");
