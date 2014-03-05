CRM
===

This is a SPA that will run our CRM for our call center.


    git clone https://bitbucket.org/aclshumway/port-router.git



Dependencies
------------

  - [Node.js](http://nodejs.org/), plus node module dependencies defined in package.json
  - [Grunt.js](https://github.com/gruntjs/grunt-cli)



Setup
-----

Install required node modules.

    npm install

Install grunt (if you need it):

    npm install -g grunt-cli

Copy example config file.
When `useMocks` is set true, mocks will be used for all api calls that have mocks defined.
Api calls that don't have mocks will most likely fail.

  - Linux:

        cp webconfig-example.js webconfig.js

  - Windows:

        copy webconfig-example.js webconfig.js

Modify hosts file. (Since the api calls use CORS, the nexsense.com domains will give you an error if they don't match what the webservice expects.
And I don't know what the webservice expects because I always run chrome with web security disabled. e.g.: `google-chrome --disable-web-security`.
I believe in Windows you can just add the --disable-web-security flag to the Target for the chrome shortcut.
Also, the cors webservice ip will be different, but I don't know what that is or even if it is currently accessibly from the outside world.)

    127.0.0.1       dev-crm.nexsense.com prod-crm.nexsense.com
    192.168.1.11    sse.services.cmscors

Run
---

The easiest way to run is to clone port-router and follow the instruction in it's [README.md](https://bitbucket.org/aclshumway/port-router).
The port-router will compile index.jade to index.html and index.less to index.css on every request for index.html.
If you want to compile those files manually you can just remove the parameters in run.sh/run.bat.
Or if you want to use IIS or some other webserver you will need to compile those files manually (`grunt build-dev`).

    git clone https://bitbucket.org/aclshumway/port-router.git


Code overview
-------------

@TODO: Knockout.js explanation

@TODO: Router/Controller explanation

  - `/app`

      - `/account` - Code for Accounts panel (view models, views(jade), specs, etc.).
      - `/core` - Generic code that isn't specific to our industry. Like third party libraries, but developed by us.
      - `/dataservices` - Code for talking to the api.
      - `/survey` - Code for Surveys panel (view models, views(jade), specs, etc.).
      - `/u-kov` - Data entry library. Basically any time data is entered, this lib is used. The README.md in this folder explains a bit more.

  - `/mock` - Api mocks. Essentially these files overwrite functions defined in /app/dataservices
  - `/stuff` - Fonts and images
  - `/styles` - Less files
  - `/tparty` - Third party libraries


Running Specs
-------------

Run the site and point Chrome to:

    http://dev-crm.nexsense.com/spec/

Currently there are only specs for core and u-kov, but that doesn't mean everything shouldn't have a test...


Build for Production
--------------------

The build process currently has these steps:

  - delete everything in ../crm-www except webconfig.js
  - copy files that don't need to be processed to ../crm-www (creates folder if it doesn't exist)
  - merges javascript files into packages and outputs them to ../crm-www (package filenames end with .debug.js)
  - uglifies/minifies the javascript packages (package filenames end with .js)
  - compiles and minifies jade files and outputs them to ../crm-www
  - compiles and minifies less files and outputs them to ../crm-www

To do all that you just need to type this one little command:

    grunt build


Javascript formatting
-----------------------------

All javascript code should be correctly formatted. Formatting rules are specified in `.jsbeautifyrc`.
You can install it with this command (you will need sudo/admin privileges) or if you have Sublime Text you can install the packages below.

    npm install -g jsbeautify


Javascript linting
-----------------------------

All javascript code should pass jshint. Linting rules are specified in `.jshintrc`.
You can install it with this command (you will need sudo/admin privileges). If you have Sublime Text you can make it easier to use by installing the packages below.
You will still need to install this node module.

    npm install -g jshint


Sublime Text 3
--------------

The project for Sublime Text is `crm.sublime-project`. A few packages you will want to include for Sublime Text are listed below:

  - Install `Package Control` - The Sublime Text package manager that makes it exceedingly simple to find, install and keep packages up-to-date.
      - Follow instructions [here](https://sublime.wbond.net/installation)

Javascript formatting

  - Install `JsFormat`
      - Tools > Command Palette (Shift+Ctrl+P)
      - Package Control: Install Package (type: pcip, then press: enter)
      - Select JsFormat package (type: jsformat, then press: enter)

Javascript linting

  - Install `SublimeLinter`
      - Tools > Command Palette (Shift+Ctrl+P)
      - Package Control: Install Package (type: pcip, then press: enter)
      - Select SublimeLinter package (type: sublimelinter, then press: enter)
  - Install `SublimeLinter-jshint`
      - Tools > Command Palette (Shift+Ctrl+P)
      - Package Control: Install Package (type: pcip, then press: enter)
      - Select SublimeLinter-jshint package (type: sublimelinter-jshint, then press: enter)
      - globally install jshint (you will need sudo/admin privileges)
          - `npm install -g jshint`
      - Preferences > Package Settings > SublimeLinter > Settings - User
          - change `"show_errors_on_save": false,` to `"show_errors_on_save": true,`

Syntax highlighting

  - Install `Jade`
      - Tools > Command Palette (Shift+Ctrl+P)
      - Package Control: Install Package (type: pcip, then press: enter)
      - Select Jade package (type: jade, then press: enter)
  - Install `Less`
      - Tools > Command Palette (Shift+Ctrl+P)
      - Package Control: Install Package (type: pcip, then press: enter)
      - Select LESS package (type: less, then press: enter)


