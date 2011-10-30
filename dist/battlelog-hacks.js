/* EA Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

// Global namespace.
var exports = window.cowboy = {};

// ==========================================================================
// Logging
// ==========================================================================

(function (exports) {
  // Binding Array#slice to Function#call allows slice(arrayLikeObject) to
  // return an array.
  var slice = Function.call.bind([].slice);
  // Binding Object#toString to Function#call allows toString(value) to
  // return an "[object [[Class]]]" string.
  var toString = Function.call.bind({}.toString);

  exports.log = function() {
    // Abort if logging disabled.
    if (!exports.log.enabled) { return; }
    // Build array of arguments, converting any Arguments object passed into
    // an array.
    var args = ["[COWBOY]"];
    for (var i = 0; i < arguments.length; i++) {
      if (toString(arguments[i]) === "[object Arguments]") {
        // Convert Arguments object into an array for prettier logging.
        args = args.concat(slice(arguments[i]));
      } else if (i === 0 && typeof arguments[i] === "string") {
        // Concatenate 1st string argument to existing "[COWBOY]" string so
        // printf-style formatting placeholders work.
        args[0] = args[0] + " " + arguments[0];
      } else {
        // Just push argument onto array.
        args.push(arguments[i]);
      }
    }
    // Actually log.
    console.log.apply(console, args);
  };

  // Enable logging by default.
  exports.log.enabled = true;
}(typeof exports === "object" && exports || this));

// ==========================================================================
// Hook & Inspect
// ==========================================================================

(function (exports) {
  // Binding Array#slice to Function#call allows slice(arrayLikeObject) to
  // return an array.
  var slice = Function.call.bind([].slice);

  // Monkey-patch a function property of an object.
  exports.hook = function(context, prop, options, callback) {
    // If options object is omitted, shuffle arguments.
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    // The original function.
    var orig = context[prop];

    if (options.post) {
      // Execute callback after original is executed.
      context[prop] = function() {
        // Unbind if once option specified.
        if (options.once) { exports.unhook(context, prop); }
        // Invoke original function.
        var result = orig.apply(this, arguments);
        // Call callback.
        callback.apply(this, arguments);
        // Return original function's result.
        return result;
      };
    } else {
      // Execute callback before original is executed. If callback returns a
      // value, return that, otherwise invoke original function, returning its
      // result.
      context[prop] = function() {
        // Unbind if once option specified.
        if (options.once) { exports.unhook(context, prop); }
        // Call callback.
        var result = callback.apply(this, arguments);
        if (options.filter) {
          // In filter mode, pass callback's return value (which must be array-
          // like) into the original function, returning its value.
          return orig.apply(result[0], result.slice(1));
        } else if (options.preempt && result !== undefined) {
          // In preempt mode, return callback's result if it's not undefined.
          return result;
        }
        // Otherwise, teturn original function's result.
        return orig.apply(this, arguments);
      };
    }
    // Set property on new function to allow unhooking.
    context[prop]._orig = orig;
  };

  // Get the original function from a hooked function.
  exports.hook.orig = function(context, prop) {
    return context[prop]._orig;
  };

  // Un-monkey-patch a function property of an object.
  exports.unhook = function(context, prop) {
    var orig = exports.hook.orig(context, prop);
    // If there's an original function, restore it.
    if (orig) {
      context[prop] = orig;
    }
  };

  // Monkey-patch all function properties of a given object to help debugging.
  exports.inspect = function(prop, context) {
    // If context was omitted, default to window.
    context || (context = window);
    // The object to be inspected.
    var obj = context[prop];
    // Iterate over all object keys.
    Object.keys(obj).filter(function(key) {
      // Skip any functions.
      return typeof obj[key] === "function";
    }).forEach(function(key) {
      var name = prop + "." + key;
      // Store a reference to the original function.
      var orig = obj[key];
      cowboy.log("Inspecting %s", name);
      // Override it with a new function.
      exports.hook(obj, key, function() {
        cowboy.log(name, arguments);
      });
    });
  };
}(typeof exports === "object" && exports || this));

// ==========================================================================
// Auto-retry Join Server
// ==========================================================================

(function() {
  var join, id;

  // Create an element to contain auto-retry status text.
  var retryStatus = $("<span/>");

  // Override existing "join" methods.
  ["joinMpServer", "joinMpFriend"].forEach(function(method) {
    cowboy.hook(launcher, method, function() {
      cowboy.log(method, arguments);
      // Stop auto-retrying.
      unretry();
      // Create a re-callable "join" function with arguments already applied.
      var orig = cowboy.hook.orig(launcher, method);
      join = Function.apply.bind(orig, this, arguments);
    });
  });

  // Override existing error handler method.
  cowboy.hook(launcher, "_triggerEvent", {post: true}, function(type, details) {
    // Only auto-retry on errors.
    if (type === "error.generic") {
      cowboy.log("Starting auto-retry countdown.", details);
      // Start countdown.
      retry();
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

// ==========================================================================
// Auto-sort Server List
// ==========================================================================

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

  // Hook jQuery#scrollTop so that it may be suppressed.
  var suppressScrollTop;
  cowboy.hook($.fn, "scrollTop", {preempt: true}, function(top) {
    // Suppress if setting the document scrollTop to 0.
    if (suppressScrollTop && top === 0 && this[0] === document) {
      cowboy.log("Suppressing scrollTop(0).");
      return this;
    }
  });

  // Hook Surface.ajaxNavigation.navigateTo (which appears ot be called every
  // time a new page-level AJAX request is made, maybe every AJAX request).
  cowboy.hook(Surface.ajaxNavigation, "navigateTo", function(url) {
    if (url.indexOf("/bf3/servers/") === 0) {
      // Suppress scrollTop if loading new serverguide content.
      suppressScrollTop = true;
    }
  });

  var count, id;
  // Re-sort the server list when all server data has been retrieved.
  function initCounter() {
    cowboy.log("Waiting for server data to be retrieved.");
    // Reset count to the number of servers displayed (the number of times that
    // serverguide.refreshHighlight will be called).
    count = serverguideSort.getAllServerSurfaceIds().length;
    // Hook serverguide.refreshHighlight (which appears to be called every time
    // a server's details (name, players, ping, etc) are returned)
    cowboy.hook(serverguide, "refreshHighlight", function() {
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
      cowboy.unhook(serverguide, "refreshHighlight");
      // Re-sort servers.
      cowboy.reSortServers();
      // Un-suppress scrollTop.
      suppressScrollTop = false;
    }
  }

  // Hook serverguide.updateFriendsPlayingOnServers (which appears to be
  // called every time the serverguide is refreshed) to init the counter.
  cowboy.hook(serverguide, "updateFriendsPlayingOnServers", function() {
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

cowboy.log("Battlelog Hacks Loaded.");
