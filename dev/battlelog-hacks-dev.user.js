// ==UserScript==
// @match http://battlelog.battlefield.com/*
// @run-at document-end
// ==/UserScript==

/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

var elem = document.createElement("script");
elem.src = "http://localhost:8000/";
document.body.appendChild(elem);
