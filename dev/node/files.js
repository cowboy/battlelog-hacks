var fs = require("fs");
var path = require("path");

// Read (and return) files array from files.json.
exports.files = function() {
  var json = fs.readFileSync(path.join(__dirname, "files.json"), "UTF8");
  return JSON.parse(json);
};

// Given an array of filepaths, concatenate their contents, stripping redundant
// comments.
exports.concat = function(files) {
  // Use defaults if files aren't specified.
  files || (files = exports.files());
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
