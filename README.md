# Battlelog Hacks

EA's new Battlelog service is pretty awesome. Except when it isn't.

## What does this script do?

* Auto-retries server join so you don't have to spam the button. To cancel auto-retry, click the "Close" button in the Game Manager error popup.
* Remembers and auto-re-applies server browser sorting preference.
* Prevents the server browser from scrolling to the top of the page on refresh.

## What might this script do in the future?

* Possibly other stuff related to server browsing / joining.

## Installation

[mainscript]: https://raw.github.com/cowboy/battlelog-hacks/master/dist/battlelog-hacks.js
[userscript]: https://raw.github.com/cowboy/battlelog-hacks/master/dist/battlelog-hacks.user.js

_Note: If you were using the [original gist version](https://gist.github.com/1323950), uninstall that first. You can do this in Chrome's "Extensions" manager._

Click [this userscript][userscript], then click Ok/Continue/Install in any browser confirmation dialogs that pop up. Once installed, reload Battlelog.

## Updating

Once the [userscript][userscript] has been installed, you should automatically see changes to the [main script file][mainscript] whenever it gets updated, just reload Battlelog to get the latest version.

## Notes

* This is a work in progress.
* Lots of messages are logged to the console. Check it out.
* This is tested only in Chrome 14 with Battlefield 3.
* It works for me.
* Hopefully ESN will fix these issues internally, rendering this script obsolete.

And for what it's worth, I've spent a LOT of time in the WebKit inspector, setting breakpoints, monkey-patching methods, tracing through call stacks, etc. I've seen things done in JavaScript that have made my head spin and are going to keep me up at night for years to come. If this script makes your life easier, I'd appreciate [a modest donation](http://benalman.com/donate). It'll help pay for the therapist I'm going to need.

## Contributing

Running in "development" mode:

1. Clone the repo (You'll probably need [Git for Windows](http://code.google.com/p/msysgit/) first).
1. Disable the `battlelog-hacks.user.js` extension in Chrome's "Extensions" manager.
2. Run `start-webserver.cmd` in the `dev` directory.
3. Drag `battlelog-hacks-dev.user.js` into the browser and click Ok/Continue/Install as-necessary.
4. Reload Battlelog.

_Remember that once you're done developing, you'll need to disable `battlelog-hacks-dev.user.js` and re-enable `battlelog-hacks.user.js` in Chrome's "Extensions" manager. Or just leave the webserver running, always._

In lieu of a formal styleguide, take care to maintain the existing coding style. Issue a pull request when done. Found a bug? [File an issue](https://github.com/cowboy/battlelog-hacks/issues).

## Release History
10/30/2011
Initial release. Not even a version number.

10/30/2011
v0.1.1
Adding "development" web server and userscript.
Auto-retry join errors are now whitelisted, to avoid auto-retrying in certain situations (like when kicked from a server).
Version number is announced in a little blue box upon start.

## License
Copyright (c) 2011 "Cowboy" Ben Alman  
Licensed under the MIT license.  
<http://benalman.com/about/license/>
