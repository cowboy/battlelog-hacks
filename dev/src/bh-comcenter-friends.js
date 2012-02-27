/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2012 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Initialize Com center friends list state");

(function() {
  // Get the current Battlelog com center friends list state object.
  var state = $S("comcenter-surface-friends").getState();

  // Fix state, logging if it actually needed to be fixed..
  function fix(mode, s) {
    // Update the Battlelog state object showingOnline/showingOffline prop.
    state["showing" + mode] = s;
    // If the currently displayed state doesn't reflect the expected state...
    mode = mode.toLowerCase();
    if (Boolean($(".comcenter-friend-" + mode + ":visible").length) !== s) {
      // Actually hide or show the friends list in the DOM.
      $("#comcenter-" + mode + "-separator").toggleClass("showing-" + mode, s);
      $(".comcenter-friend-" + mode).toggleClass("comcenter-friend-hidden", !s);
    }
  }

  // Instead of attempting to store and restore state, always start with Online
  // friends opened and Offline friends closed. It's just easier that way.
  fix("Online", true);
  fix("Offline", false);

  // Force Battlelog to update its internal state objects.
  comcenter.updateLocalStorage();
}());
