/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Auto-sort Server List");

(function() {
  // Watch for sorting element clicks.
  $(document).delegate(".serverguide-sorter", "click", function(e, triggered) {
    // Abort if manually triggered.
    if (triggered) { return false; }
    // Get current sort mode and direction.
    var mode = sortMode(this);
    var dir = sortDir(this);
    cowboy.log("Storing server sorting mode: %s, dir: %s.", mode, dir);
    // Store sort mode and direction.
    localStorage.setItem("cb_sort_mode", mode);
    localStorage.setItem("cb_sort_dir", dir);
  });

  // Get sort mode from a given element.
  function sortMode(elem) {
    var matches = /serverguide-sorting-(\w+)/.exec(elem.className);
    return matches && matches[1];
  }

  // Get sort direction from a given element.
  function sortDir(elem) {
    var matches = /serverguide-sort-(\w+)/.exec(elem.className);
    return matches && matches[1];
  }

  // Re-sort the server list based on the last stored sort mode + direction.
  // I couldn't find a non-DOM way to do this. I feel gross.
  cowboy.reSortServers = function() {
    // Get stored sort mode.
    var mode = localStorage.getItem("cb_sort_mode");
    // If mode has never been stored, abort.
    if (!mode) { return; }
    // Find DOM element corresponding to this sort mode.
    var elem = $(".serverguide-sorting-" + mode);
    // If element doesn't exist, abort.
    if (elem.length === 0) { return; }
    // Get the current sort direction from the element.
    var dir = sortDir(elem[0]);
    // If the element has a sort direction, it has already been sorted. Abort.
    if (dir) { return; }

    // Get stored sort dir.
    dir = localStorage.getItem("cb_sort_dir");
    cowboy.log("Re-sorting servers using mode: %s, dir: %s.", mode, dir);
    // Click the element once to sort up.
    elem.trigger("click", [true]);
    // If sorting down, click the element a second time.
    if (dir === "down") {
      elem.trigger("click", [true]);
    }

    // After sorting, the first server should be highlighted. Get a list of
    // sorted server id strings.
    var ids = serverguideSort.getAllServerSurfaceIds();
    // If there aren't any servers, abort.
    if (ids.length === 0) { return; }
    // Highlight the first server (its numeric id value must be parsed from
    // the id string).
    serverguide.highlightServerIndex(+ids[0].split('-')[2]);
  };

  var count, id;
  // Re-sort the server list when all server data has been retrieved.
  function initCounter() {
    cowboy.log("Waiting for server data to be retrieved.");
    // Reset count to the number of servers displayed (the number of times that
    // serverguide.refreshHighlight will be called).
    count = serverguideSort.getAllServerSurfaceIds().length;
    // Hook serverguide.refreshHighlight (which appears to be called every time
    // a server's details (name, players, ping, etc) are returned)
    cowboy.hooker.hook(serverguide, "refreshHighlight", function() {
      // Clear any existing timeout.
      clearTimeout(id);

      if (--count === 0) {
        // Unhook and re-sort servers.
        done();
      } else {
        // Auto-done() after a timeout, in case serverguide.refreshHighlight is
        // called less than the expected number of times.
        id = setTimeout(done, 1000);
      }
    });

    // Unhook and re-sort servers.
    function done() {
      cowboy.log("Server data has been retrieved.");
      // Unhook.
      cowboy.hooker.unhook(serverguide, "refreshHighlight");
      // Re-sort servers.
      cowboy.reSortServers();
    }
  }

  // Hook serverguide.updateFriendsPlayingOnServers (which appears to be
  // called every time the serverguide is refreshed) to init the counter.
  cowboy.hooker.hook(serverguide, "updateFriendsPlayingOnServers", function() {
    // Init counter.
    initCounter();
    // Not sure why serverguide.refreshHighlight gets called two extra times,
    // but I don't really care either.
    count += 2;
  });

  // The serverguide form is currently visible, so Battlelog was loaded on the
  // serverguide page. Handle re-sorting servers here (because this userscript
  // runs after the initial serverguide.onPageShow is called, and can't hook
  // it the very first time).
  if ($("#serverguide-filter-form").is(":visible")) {
    initCounter();
  }
}());
