// ==UserScript==
// @match http://battlelog.battlefield.com/bf3/*
// @run-at document-end
// ==/UserScript==

/* EA Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

var elem = document.createElement("script");
elem.src = "https://github.com/cowboy/battlelog-hacks/blob/master/dist/battlelog-hacks.js";
document.body.appendChild(elem);
