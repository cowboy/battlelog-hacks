/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2012 "Cowboy" Ben Alman; Licensed MIT */

// Global namespace.
window.cowboy = {
  version: "0.3.4",
  registry: [],
  register: function(name) {
    cowboy.registry.push(name);
    cowboy.log("Registered: " + name);
  },
  loaded: function() {
    cowboy.popup("Battlelog Hacks v" + cowboy.version + " loaded.");
  }
};

// Hooker.
var exports = cowboy.hooker = {};

/*! JavaScript Hooker - v0.2.3 - 1/22/2012
* http://github.com/cowboy/javascript-hooker
* Copyright (c) 2012 "Cowboy" Ben Alman; Licensed MIT */

(function(exports) {
  // Get an array from an array-like object with slice.call(arrayLikeObject).
  var slice = [].slice;
  // Get an "[object [[Class]]]" string with toString.call(value).
  var toString = {}.toString;

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

  // Execute callback(s) for properties of the specified object.
  function forMethods(obj, props, callback) {
    var prop;
    if (typeof props === "string") {
      // A single prop string was passed. Create an array.
      props = [props];
    } else if (props == null) {
      // No props were passed, so iterate over all properties, building an
      // array. Unfortunately, Object.keys(obj) doesn't work everywhere yet, so
      // this has to be done manually.
      props = [];
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          props.push(prop);
        }
      }
    }
    // Execute callback for every method in the props array.
    var i = props.length;
    while (i--) {
      // If the property isn't a function...
      if (toString.call(obj[props[i]]) !== "[object Function]" ||
        // ...or the callback returns false...
        callback(obj, props[i]) === false) {
        // ...remove it from the props array to be returned.
        props.splice(i, 1);
      }
    }
    // Return an array of method names for which the callback didn't fail.
    return props;
  }

  // Monkey-patch (hook) a method of an object.
  exports.hook = function(obj, props, options) {
    // If the props argument was omitted, shuffle the arguments.
    if (options == null) {
      options = props;
      props = null;
    }
    // If just a function is passed instead of an options hash, use that as a
    // pre-hook function.
    if (typeof options === "function") {
      options = {pre: options};
    }

    // Hook the specified method of the object.
    return forMethods(obj, props, function(obj, prop) {
      // The original (current) method.
      var orig = obj[prop];
      // The new hooked function.
      function hooked() {
        var result, origResult, tmp;

        // Get an array of arguments.
        var args = slice.call(arguments);

        // If passName option is specified, prepend prop to the args array,
        // passing it as the first argument to any specified hook functions.
        if (options.passName) {
          args.unshift(prop);
        }

        // If a pre-hook function was specified, invoke it in the current
        // context with the passed-in arguments, and store its result.
        if (options.pre) {
          result = options.pre.apply(this, args);
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
          // context, passing in the result of the original function as the
          // first argument, followed by any passed-in arguments.
          tmp = options.post.apply(this, [origResult].concat(args));
          if (tmp instanceof HookerOverride) {
            // If the post-hook returned hooker.override(value), use the passed
            // value, otherwise use the previously computed result.
            result = tmp.value;
          }
        }

        // Unhook if the "once" option was specified.
        if (options.once) {
          exports.unhook(obj, prop);
        }

        // Return the result!
        return result;
      }
      // Re-define the method.
      obj[prop] = hooked;
      // Fail if the function couldn't be hooked.
      if (obj[prop] !== hooked) { return false; }
      // Store a reference to the original method as a property on the new one.
      obj[prop]._orig = orig;
    });
  };

  // Get a reference to the original method from a hooked function.
  exports.orig = function(obj, prop) {
    return obj[prop]._orig;
  };

  // Un-monkey-patch (unhook) a method of an object.
  exports.unhook = function(obj, props) {
    return forMethods(obj, props, function(obj, prop) {
      // Get a reference to the original method, if it exists.
      var orig = exports.orig(obj, prop);
      // If there's no original method, it can't be unhooked, so fail.
      if (!orig) { return false; }
      // Unhook the method.
      obj[prop] = orig;
    });
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
  var indent = 0;
  cowboy.inspect = function(context, prop) {
    // If context was omitted, default to window.
    if (typeof context === "string") {
      prop = context;
      context = window;
    }
    // The object to be inspected.
    var obj = context[prop];
    var methods = cowboy.hooker.hook(obj, {
      passName: true,
      pre: function(name) {
        indent++;
        // Log arguments the method was called with.
        cowboy.log(repeat(">", indent), prop + "." + name, slice(arguments, 1));
      },
      post: function(result, name) {
        // Log the result.
        cowboy.log(repeat("<", indent), "(" + prop + "." + name + ")", result);
        indent = Math.max(0, indent - 1);
      }
    });
    cowboy.log('Inspecting "%s" methods: %o', prop, methods);
  };

  // Repeat a string n times.
  function repeat(str, n) {
    return Array(n + 1).join(str);
  }

  // Log and show a little blue popup notice.
  cowboy.popup = function(msg) {
    comcenter.showReceipt(msg);
    cowboy.log(msg);
  };
}());

cowboy.register("Auto-retry join server");

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
    launcher.ALERT.ERR_SERVERCONNECT_INVALIDGAMESTATE,
    launcher.ALERT.ERR_SERVERCONNECT_TIMEOUT,
    launcher.ALERT.ERR_SERVERCONNECT,
    launcher.ALERT.ERR_PARAM_INVALIDMISSION,
    launcher.ALERT.ERR_CONFIG_MISSMATCH,
    launcher.ALERT.ERR_MATCHMAKE.START_MATCHMAKING_FAILED,
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

cowboy.loaded();