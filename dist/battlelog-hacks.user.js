// ==UserScript==
// @match http://battlelog.battlefield.com/bf3/*
// @run-at document-end
// ==/UserScript==

/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

var elem = document.createElement("script");
elem.src = "https://raw.github.com/cowboy/battlelog-hacks/master/dist/battlelog-hacks.js";
document.body.appendChild(elem);
