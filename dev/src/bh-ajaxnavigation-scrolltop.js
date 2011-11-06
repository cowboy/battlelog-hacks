/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Suppress scrollTop on serverlist refresh");

(function() {
  var suppressScrollTop;

  // Hook jQuery#scrollTop so that it may be suppressed.
  cowboy.hooker.hook($.fn, "scrollTop", function(top) {
    // Suppress if setting the document scrollTop to 0.
    if (suppressScrollTop && top === 0 && this[0] === document) {
      cowboy.log("Suppressing scrollTop.");
      suppressScrollTop = false;
      return cowboy.hooker.preempt(this);
    }
  });
  
  // Hook Surface.ajaxNavigation.navigateTo (which appears to be called every
  // time a new page-level AJAX request is made, maybe every AJAX request).
  cowboy.hooker.hook(Surface.ajaxNavigation, "navigateTo", function(url) {
    if (url.indexOf("/bf3/servers/") === 0) {
      // Suppress scrollTop if loading new serverguide content.
      suppressScrollTop = true;
    }
  });
}());
