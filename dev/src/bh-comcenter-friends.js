/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Remember Com center friends list state");

(function() {
  // The comcenter.updateLocalStorage method seems to be called whenever the
  // online and offline friends lists are opened or closed.
  cowboy.hooker.hook(comcenter, "updateLocalStorage", {
    post: function() {
      // Get the current com center friends list state.
      var state = $S("comcenter-surface-friends").getState();
      // Store state for later use.
      localStorage.setItem("cb_show_friends_online", state.showingOnline);
      localStorage.setItem("cb_show_friends_offline", state.showingOffline);
    }
  });

  // Get the current Battlelog com center friends list state object.
  var state = $S("comcenter-surface-friends").getState();

  // Fix state, logging if it actually needed to be fixed..
  function fix(mode) {
    // Retrieve the previously-stored state.
    var s = localStorage.getItem("cb_show_friends_" + mode) === "true";
    // Update the Battlelog state object showingOnline/showingOffline prop.
    state["showing" + mode[0].toUpperCase() + mode.slice(1)] = s;
    // If the currently displayed state doesn't reflect the expected state...
    if (Boolean($(".comcenter-friend-" + mode + ":visible").length) !== s) {
      // Log to the console.
      cowboy.log("Com center " + mode + " friends list should have been " +
        (s ? "visible" : "hidden") + " but wasn't, fixing.");
      // Actually hide or show the friends list in the DOM.
      $("#comcenter-" + mode + "-separator").toggleClass("showing-" + mode, s);
      $(".comcenter-friend-" + mode).toggleClass("comcenter-friend-hidden", !s);
    }
  }

  // Fix both online and offline state.
  fix("online");
  fix("offline");

  // Force Battlelog to update its internal state objects.
  comcenter.updateLocalStorage();
}());
