/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2012 "Cowboy" Ben Alman; Licensed MIT */

// Global namespace.
window.cowboy = {
  version: "0.3.4",
  registry: [],
  register: function(name) {
    cowboy.registry.push(name);
    cowboy.log("Registered: " + name);
  },
  loaded: function() {
    cowboy.popup("Battlelog Hacks v" + cowboy.version + " loaded.");
  }
};

// Hooker.
var exports = cowboy.hooker = {};
