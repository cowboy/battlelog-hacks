/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2012 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Auto-select first server");

(function() {
  // Highlight the first server in the server list.
  cowboy.selectFirstServer = function() {
    // Get a list of sorted server id strings.
    var ids = serverguideSort.getAllServerSurfaceIds();
    // If there aren't any servers, abort.
    if (ids.length === 0) { return; }
    // Get the first server element.
    var elem = $("#" + ids[0]);
    // Get the server name.
    var name = $.trim(elem.find(".serverguide-cell-name-server-name").text());
    cowboy.log("Selecting server:", name);
    // Click it.
    elem.find(".serverguide-bodycell:first").click();
  };

  // Whenever the serverlist is sorted, highlight the first server.
  cowboy.hooker.hook(serverguideSort, "sortSurfaces", {
    post: cowboy.selectFirstServer
  });

  // The serverguide form is currently visible, so Battlelog was loaded on the
  // serverguide page. Handle highlighting the first server here (because this
  // userscript runs after the initial serverguideSort.sortSurfaces is called,
  // and can't hook it the very first time).
  if ($("#serverguide-filter-form").is(":visible")) {
    cowboy.selectFirstServer();
  }
}());


