/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

// Global namespace.
window.cowboy = {
  version: "0.3.0",
  registry: [],
  register: function(name) {
    cowboy.registry.push(name);
  },
  loaded: function() {
    cowboy.popup("Battlelog Hacks v" + cowboy.version + " loaded.");
    cowboy.registry.forEach(function(name) {
      cowboy.log("Registered: " + name);
    });
  }
};

// Hooker.
var exports = cowboy.hooker = {};

/* JavaScript Hooker - v0.2.1 - 10/31/2011
 * http://github.com/cowboy/javascript-hooker
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */

(function(exports) {
  // Since undefined can be overwritten, an internal reference is kept.
  var undef;
  // Get an array from an array-like object with slice.call(arrayLikeObject).
  var slice = [].slice;

  // I can't think of a better way to ensure a value is a specific type other
  // than to create instances and use the `instanceof` operator.
  function HookerOverride(v) { this.value = v; }
  function HookerPreempt(v) { this.value = v; }
  function HookerFilter(c, a) { this.context = c; this.args = a; }

  // When a pre- or post-hook returns the result of this function, the value
  // passed will be used in place of the original function's return value. Any
  // post-hook override value will take precedence over a pre-hook override
  // value.
  exports.override = function(value) {
    return new HookerOverride(value);
  };

  // When a pre-hook returns the result of this function, the value passed will
  // be used in place of the original function's return value, and the original
  // function will NOT be executed.
  exports.preempt = function(value) {
    return new HookerPreempt(value);
  };

  // When a pre-hook returns the result of this function, the context and
  // arguments passed will be applied into the original function.
  exports.filter = function(context, args) {
    return new HookerFilter(context, args);
  };

  // Monkey-patch (hook) a method of an object.
  exports.hook = function(obj, methodName, options) {
    // If just a function is passed instead of an options hash, use that as a
    // pre-hook function.
    if (typeof options === "function") {
      options = {pre: options};
    }
    // The original (current) method.
    var orig = obj[methodName];
    // Re-define the method.
    obj[methodName] = function() {
      var result, origResult, tmp;
      // If a pre-hook function was specified, invoke it in the current context
      // with the passed-in arguments, and store its result.
      if (options.pre) {
        result = options.pre.apply(this, arguments);
      }

      if (result instanceof HookerFilter) {
        // If the pre-hook returned hooker.filter(context, args), invoke the
        // original function with that context and arguments, and store its
        // result.
        origResult = result = orig.apply(result.context, result.args);
      } else if (result instanceof HookerPreempt) {
        // If the pre-hook returned hooker.preempt(value) just use the passed
        // value and don't execute the original function.
        origResult = result = result.value;
      } else {
        // Invoke the original function in the current context with the
        // passed-in arguments, and store its result.
        origResult = orig.apply(this, arguments);
        // If the pre-hook returned hooker.override(value), use the passed
        // value, otherwise use the original function's result.
        result = result instanceof HookerOverride ? result.value : origResult;
      }

      if (options.post) {
        // If a post-hook function was specified, invoke it in the current
        // context, passing in the result of the original function as the first
        // argument, followed by any passed-in arguments.
        tmp = options.post.apply(this, [origResult].concat(slice.call(arguments)));
        if (tmp instanceof HookerOverride) {
          // If the post-hook returned hooker.override(value), use the passed
          // value, otherwise use the previously computed result.
          result = tmp.value;
        }
      }
      // Unhook if the "once" option was specified.
      if (options.once) {
        exports.unhook(obj, methodName);
      }
      // Return the result!
      return result;
    };
    // Store a reference to the original method as a property on the new one.
    obj[methodName]._orig = orig;
  };
  
  // Get a reference to the original method from a hooked function.
  exports.orig = function(obj, methodName) {
    return obj[methodName]._orig;
  };

  // Un-monkey-patch (unhook) a method of an object.
  exports.unhook = function(obj, methodName) {
    var orig = exports.orig(obj, methodName);
    // Only unhook if it hasn't already been unhooked.
    if (orig) {
      obj[methodName] = orig;
    }
  };
}(typeof exports === "object" && exports || this));

// ==========================================================================
// Logging
// ==========================================================================

(function () {
  // Binding Array#slice to Function#call allows slice(arrayLikeObject) to
  // return an array.
  var slice = Function.call.bind([].slice);
  // Binding Object#toString to Function#call allows toString(value) to
  // return an "[object [[Class]]]" string.
  var toString = Function.call.bind({}.toString);

  cowboy.log = function() {
    // Abort if logging disabled.
    if (!cowboy.log.enabled) { return; }
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
  cowboy.log.enabled = true;

  // Hook all function properties of a given object to help debugging.
  cowboy.inspect = function(context, prop) {
    // If context was omitted, default to window.
    if (typeof context === "string") {
      prop = context;
      context = window;
    }
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
      cowboy.hooker.hook(obj, key, function() {
        cowboy.log(name, arguments);
      });
    });
  };

  // Log and show a little blue popup notice.
  cowboy.popup = function(msg) {
    comcenter.showReceipt(msg);
    cowboy.log(msg);
  };
}());

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
  cowboy.hooker.hook(serverguideSort, "sortSurfaces", {
    post: cowboy.selectFirstServer
  });
  cowboy.hooker.hook(serverguideSort, "sortByPing", {
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

cowboy.register("Suppress scrollTop on Serverlist Refresh");

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

cowboy.loaded();