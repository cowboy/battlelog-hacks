/* Battlelog Hacks
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT */

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
