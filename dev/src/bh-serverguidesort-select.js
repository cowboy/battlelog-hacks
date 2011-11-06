/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Auto-select First Server");

(function() {
  // Highlight the first server in the server list.
  cowboy.selectFirstServer = function() {
    // Get a list of sorted server id strings.
    var ids = serverguideSort.getAllServerSurfaceIds();
    // If there aren't any servers, abort.
    if (ids.length === 0) { return; }
    // Highlight the first server (its numeric id value must be parsed from
    // the id string).
    serverguide.highlightServerIndex(+ids[0].split('-')[2]);
  };

  // Whenever the serverlist is sorted, highlight the first server.
  cowboy.hooker.hook(serverguideSort, ["sortSurfaces", "sortByPing"], {
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
