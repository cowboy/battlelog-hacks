/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

// Global namespace.
window.cowboy = {
  version: "0.3.0",
  registry: [],
  register: function(name) {
    cowboy.registry.push(name);
  },
  loaded: function() {
    cowboy.popup("Battlelog Hacks v" + cowboy.version + " loaded.");
    cowboy.registry.forEach(function(name) {
      cowboy.log("Registered: " + name);
    });
  }
};

// Hooker.
var exports = cowboy.hooker = {};
