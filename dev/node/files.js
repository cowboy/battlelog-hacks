var fs = require("fs");

exports.files = [
  "src/intro.js",
  "javascript-hooker/dist/ba-hooker.js",
  "src/log.js",
  "src/auto-retry.js",
  "src/auto-select.js",
  "src/suppress-scrolltop.js",
  "src/outro.js"
];

exports.concat = function(files) {
  // Use defaults if files aren't specified.
  files || (files = exports.files);
  // Concat files.
  return files.map(function(filepath, i) {
    var src = fs.readFileSync(filepath, "UTF8");
    // Chomp!
    src = src.replace(/[\s\n]*$/, "");
    // Remove leading comment from all but the first Battlelog Hacks internal
    // files when building.
    if (i > 0) {
      src = src.replace(/^[\s\n]*\/\* Battlelog Hacks[\s\S]*?\*\/[\s\n]*/, "");
    }
    return src;
  }).join("\n\n");
};
