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

1. Install [Git for Windows](http://code.google.com/p/msysgit/) if you don't already have it.
2. In Git Bash, run `git clone git://github.com/cowboy/battlelog-hacks.git && cd battlelog-hacks && git submodule init && git submodule update`
3. Disable the `battlelog-hacks.user.js` extension in Chrome's "Extensions" manager.
4. Drag `battlelog-hacks-dev.user.js` into the browser and click Ok/Continue/Install as-necessary.
5. Run `start-webserver.cmd` from the `dev` subdirectory.
6. Edit scripts in the `dev\src` subdirectory.
7. Reload Battlelog.
8. Repeat steps 6-7 ad nauseum. Note that if you add or rename files, you'll need to edit `dev\node\files.js` and kill/restart the webserver (step 5).
9. Once done, run `build.cmd` from the `dev` subdirectory to build `dist\battlelog-hacks.js`.

_Remember that once you're done developing, you'll need to disable `battlelog-hacks-dev.user.js` and re-enable `battlelog-hacks.user.js` in Chrome's "Extensions" manager. Or just leave the webserver running, always._

In lieu of a formal styleguide, take care to maintain the existing coding style. Issue a pull request when done. Found a bug? [File an issue](https://github.com/cowboy/battlelog-hacks/issues).

_Also, please don't edit files in the "dist" subdirectory as they are generated via `build.cmd`. You'll find source code in the `dev\src` subdirectory!_

## Release History
10/30/2011
Initial release. Not even a version number.

10/30/2011
v0.1.1
Adding "development" web server and userscript.
Auto-retry join errors are now whitelisted, to avoid auto-retrying in certain situations (like when kicked from a server).
Version number is announced in a little blue box upon start.

10/31/2011
v0.2.0
Split source into sub-files.
Broke the hooking stuff out into JavaScript Hooker, included as a submodule.
Created a build tool and updated the dev web server.

## License
Copyright (c) 2011 "Cowboy" Ben Alman  
Licensed under the MIT license.  
<http://benalman.com/about/license/>
