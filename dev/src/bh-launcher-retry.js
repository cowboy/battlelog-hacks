/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

cowboy.register("Auto-retry Join Server");

(function() {
  var join, id;

  // Create an element to contain auto-retry status text.
  var retryStatus = $("<span/>");

  // Override existing "join" methods.
  ["joinMpServer", "joinMpFriend"].forEach(function(method) {
    cowboy.hooker.hook(launcher, method, function() {
      cowboy.log(method, arguments);
      // Stop auto-retrying.
      unretry();
      // Create a re-callable "join" function with arguments already applied.
      var orig = cowboy.hooker.orig(launcher, method);
      join = Function.apply.bind(orig, this, arguments);
    });
  });

  // A list of errors that should trigger auto-retry. Painstakingly parsed from
  // gamemanager.handleErrors.
  var validErrors = [
    launcher.ALERT.ERR_LAUNCH_DISABLED,
    launcher.ALERT.ERR_EMPTY_JOINSTATE,
    launcher.ALERT.ERR_FAILED_PERSONACALL,
    launcher.ALERT.ERR_BACKEND_HTTP,
    launcher.ALERT.ERR_BACKEND_ROUTE,
    launcher.ALERT.ERR_TOO_MANY_ATTEMPTS,
    launcher.ALERT.ERR_DISCONNECT_GAME_SERVERFULL,
    launcher.ALERT.ERR_SERVERCONNECT_SERVERFULL,
    launcher.ALERT.ERR_SERVERCONNECT_FULL,
    launcher.ALERT.ERR_SERVER_QUEUE_FULL,
    launcher.ALERT.ERR_SERVERCONNECT,
    launcher.ALERT.ERR_SERVERCONNECT_WRONGPASSWORD,
    launcher.ALERT.ERR_CONFIG_MISSMATCH,
    launcher.ALERT.ERR_GENERIC,
    launcher.ALERT.ERR_MATCHMAKE.START_MATCHMAKING_FAILED,
    launcher.ALERT.ERR_DISCONNECT_GAME_NOREPLY,
    launcher.ALERT.ERR_DISCONNECT_GAME_TIMEDOUT,
    launcher.ALERT.ERR_INVALID_GAME_STATE_ACTION
  ];

  // Override existing error handler method.
  cowboy.hooker.hook(launcher, "_triggerEvent", {
    post: function(result, type, details) {
      // Only auto-retry on valid errors.
      if (type === "error.generic" && validErrors.indexOf(details[2]) !== -1) {
        cowboy.log("Starting auto-retry countdown.", details);
        // Start countdown.
        retry();
      }
    }
  });

  // Start auto-retrying.
  function retry() {
    // Stop any currently executing auto-retry loop.
    unretry(true);

    // 10-seconds seems like a good number.
    var count = 10;

    // Attach status element to the DOM.
    retryStatus.appendTo(".gamemanager-launchstate-gameready");

    function update() {
      // Update status text.
      retryStatus.html(" (Auto-retry&nbsp;in&nbsp;" + count + ")");
      // If counter has reached 0, stop auto-retrying and join.
      if (count-- === 0) {
        cowboy.log("Retrying now.");
        unretry(true);
        join();
      }
    }
    // Start counter.
    update();
    id = setInterval(update, 1000);
  }

  // Stop auto-retrying.
  function unretry(silent) {
    if (!id) { return; }
    cowboy.log("Stopping auto-retry.");
    // Actually stop the auto-retry.
    clearInterval(id);
    id = null;
    // Detach the status element from the DOM and empty it.
    retryStatus.detach().empty();
  }

  // If user clicks "Close" button in "Could not join..." dialog, stop
  // auto-retrying.
  $(document).delegate("#gamemanager-state-close", "click", unretry);
}());
