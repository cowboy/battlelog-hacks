# Battlelog Hacks

EA's new Battlelog service is pretty awesome. Except when it isn't.

## What does this script do?

* Auto-retries server join so you don't have to spam the button. To cancel auto-retry, click the "Close" button in the Game Manager error popup.
* <del>Remembers and auto-re-applies server browser sorting preference.</del> **Fixed!**
* Automatically selects the first server in the server browser after refreshing or sorting.
* Prevents the server browser from scrolling to the top of the page on refresh.
* Ensures that Com center Online friends starts opened, while Offline friends starts collapsed.

## What might this script do in the future?

* Possibly other stuff related to server browsing / joining.

## Installation

[mainscript]: https://raw.github.com/cowboy/battlelog-hacks/master/dist/battlelog-hacks.js
[userscript]: https://raw.github.com/cowboy/battlelog-hacks/master/dist/battlelog-hacks.user.js
[greasemonkey]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/

If you're using Firefox, make sure you have the [Greasemonkey][greasemonkey] add-on installed first.

_Note: If you were using the [original gist version](https://gist.github.com/1323950), uninstall that first. See the "What's a Userscript?" section of this document for more information about managing userscripts._

**To install, [click this userscript][userscript], then click Ok/Continue/Install in any browser confirmation dialogs that pop up.** Once installed, reload the Battlelog webpage. You should see a little blue message in the top left of Battlelog confirming that Battlelog Hacks has been loaded.

## What's a Userscript?

Userscripts are a convenient way to be able to add extra functionality to webpages. Chrome has native support for userscripts as Extensions, and Firefox supports userscripts via the [Greasemonkey][greasemonkey] add-on.

To manage userscripts:

* In Chrome: Tools > Extensions
* In Firefox: Greasemonkey > Manage User Scripts

## Updating

Once the [userscript][userscript] has been installed, changes to the [main script file][mainscript] will automatically load whenever it's updated. Just reload the Battlelog webpage to get the latest version.

## Notes

* This is a work in progress.
* Lots of messages are logged to the console. Check it out.
* This has been tested in Firefox 7 (with [Greasemonkey][greasemonkey]) and Chrome 17.
* It works for me.
* Hopefully ESN will fix these issues internally, rendering this script obsolete.

And for what it's worth, I've spent a LOT of time in the WebKit inspector, setting breakpoints, monkey-patching methods, tracing through call stacks, etc. I've seen things done in JavaScript that have made my head spin and are going to keep me up at night for years to come. If this script makes your life easier, I'd appreciate [a modest donation](http://benalman.com/donate). It'll help pay for the therapist I'm going to need.

## Contributing

Running in "development" mode:

1. Install [Git for Windows](http://code.google.com/p/msysgit/) if you don't already have it.
2. In Git Bash, run `git clone git://github.com/cowboy/battlelog-hacks.git && cd battlelog-hacks && git submodule init && git submodule update`
3. Disable the `battlelog-hacks.user.js` userscript / extension. See the "What's a Userscript?" section for more information on this.
4. Drag `battlelog-hacks-dev.user.js` into the browser and click Ok/Continue/Install as-necessary.
5. Run `start-webserver.cmd` from the `dev` subdirectory.
6. Edit scripts in the `dev\src` subdirectory.
7. Reload Battlelog.
8. Repeat steps 6-7 ad nauseum. Note that if you add or rename files, you'll need to edit `dev\node\files.js` and kill/restart the webserver (step 5).
9. Once done, run `build.cmd` from the `dev` subdirectory to build `dist\battlelog-hacks.js`.

_Remember that once you're done developing, you'll need to disable `battlelog-hacks-dev.user.js` and re-enable `battlelog-hacks.user.js`. Or just leave the webserver running, always._

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

11/4/2011
v0.3.0
Removed server browser re-sort code (which has been implemented natively).
Automatically selects the first server in the server browser after refreshing or sorting.

11/6/2011
v0.3.1
Updated JavaScript Hooker.
Now remembers Com center friends list state.
Updated Server join auto-retry error list.
Streamlined development process slightly.

11/6/2011
v0.3.2
Bugfix: When the server list is refreshed or sorted, the first server is now both highlighted AND selected (it was only getting highlighted).

11/8/2011
v0.3.3
Com center online friends now default to shown, while offline friends default to hidden.

2/26/2011
v0.3.4
Com center online friends are always shown by default, while offline friends are always hidden by default.

## License
Copyright (c) 2012 "Cowboy" Ben Alman  
Licensed under the MIT license.  
<http://benalman.com/about/license/>
