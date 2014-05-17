CRM
===

This is a SPA that will run our CRM for our call center.



Dependencies
------------

  * [Node.js](http://nodejs.org/)
  * [Grunt.js](https://github.com/gruntjs/grunt-cli) (you will need sudo/admin privileges)

        npm install -g grunt-cli



Setup
-----

* Install required node modules.

        npm install

* Initialize project

        grunt init

* (This step is not required) Set `useMocks` in webconfig.js to true.
This will make it so mocks will be used for all api calls that have mocks defined. Api calls that don't have mocks will most likely fail.

* Modify hosts file. (Since the api calls use CORS, the nexsense.com domains will give you an error if they don't match what the webservice expects.
And I don't know what the webservice expects because I always run chrome with web security disabled. e.g.: `google-chrome --disable-web-security`.
I believe in Windows you can just add the --disable-web-security flag to the Target for the chrome shortcut.)

        127.0.0.1       dev-crm.nexsense.com prod-crm.nexsense.com


Committing code
---------------

Before checking in any code, this command should not have any errors
(If you're not on Windows you can use the `setup-hooks.sh` script to set up a pre-commit hook to automatically run this command for you when every you're committing):

    grunt precommit

If there are jsbeautifier errors you can run `grunt jsformat` to format all javascript files
If there are jshint errors you'll probably have to edit the files by hand


Javascript formatting
-----------------------------

All javascript code should be correctly formatted. Formatting rules are specified in `.jsbeautifyrc`.
You can run the below command to format all javascript files or if you have Sublime Text you can install the packages below to format files are you edit them.

    grunt jsformat


Javascript linting
-----------------------------

All javascript code should pass jshint. Linting rules are specified in `.jshintrc`.
You can install it with the command below (you will need sudo/admin privileges). If you have Sublime Text you can make it easier to use by installing the packages below.
Although, you will still need to install this node module.

    npm install -g jshint


Run
---

The easiest way to run is to clone port-router and follow the instruction in it's [README.md](https://bitbucket.org/aclshumway/port-router).
The port-router will compile index.jade to index.html and index.less to index.css on every request for index.html.
If you want to compile those files manually you can just remove the parameters in run.sh/run.bat.
Or if you want to use IIS or some other webserver you will need to compile those files manually (`grunt build-dev`).

    git clone https://bitbucket.org/aclshumway/port-router.git


Code overview
-------------

### Folder structure ###

  * `/app`

      * `/account` - Code for Accounts panel (view models, views(jade), specs, etc.).
      * `/core` - Generic code that isn't specific to our industry. Like third party libraries, but developed by us.
      * `/dataservices` - Code for talking to the api.
      * `/survey` - Code for Surveys panel (view models, views(jade), specs, etc.).
      * `/u-kov` - Data entry library. Basically, any time data is entered, this lib is used. The README.md in this folder explains a bit more.

  * `/mock` - Api mocks. Essentially these files overwrite functions defined in /app/dataservices
  * `/stuff` - Fonts and images
  * `/styles` - Less files that become css
  * `/tparty` - Third party libraries

### UI ###

The UI starts as jade and less files that are compiled to html and css, respectively.
When index.jade is compiled to index.html all the jade files are merged into it as 'templates'.
Compiling index.less also merges all the less files that it references into index.css.
[Knockout.js](http://knockoutjs.com/) is used to dynamically create the UI using the 'templates'.


### Routing ###

The routing system keeps the url hash in sync with the website and vice versa.
This is accomplished using a hierarchical structure of ControllerViewModels.
Each controller has a list of child view models. Each child can be a controller view model or normal view model(inherits from BaseViewModel).
An example of what the routing system does can be found below:

Given this route:

    router.addRoute(app.panelMap.accounts, 'accounts', ':masterid/:id/:tab/:p1', {});

And this url:

    http://dev-crm.nexsense.com/#/accounts/3000001/100212/checklist/systemdetails

The routing system takes these steps:

  1. convert url hash to routeData object

        routeData = {
          "route": "accounts",
          "masterid": "3000001",
          "id": "100212",
          "tab": "checklist",
          "p1": "systemdetails",
        }

  2. activate top level controller
      1. mark as active
      1. load data asynchronously (this should be done in the onLoad function `onLoad(routeData, extraData, join)`)
          1. `routeData` - url hash as an object
          1. `extraData` - can only be used when navigating to a route from within code
          1. `join` - instance of joiner (`core/joiner.js`). Essentially the callback to notify when the data has loaded.
  3. find child of controller that matches routeData OR if nothing matches, use the first child
  4. recursively repeat steps 2 & 3, replacing top level controller with the child found in step 3

Currently panel view models (top level controllers) are created and their routes are registered in this file: `/app/app.js`.

Running Specs
-------------

Run the site and point Chrome to:

    http://dev-crm.nexsense.com/spec/

Currently there are only specs for core and u-kov, but that doesn't mean everything shouldn't have a spec...


Build for Production
--------------------

The build process currently has these steps:

  * delete everything in ../crm-www except webconfig.js
  * copy files that don't need to be processed to ../crm-www (creates folder if it doesn't exist)
  * merges javascript files into packages and outputs them to ../crm-www (package filenames end with .debug.js)
  * uglifies/minifies the javascript packages (package filenames end with .js)
  * compiles and minifies jade files and outputs them to ../crm-www
  * compiles and minifies less files and outputs them to ../crm-www

To do all that you just need to type this one little command:

    grunt build


Sublime Text 3
--------------

The project for Sublime Text is `crm.sublime-project`. A few packages you will want to include for Sublime Text are listed below:

  * Install `Package Control` - The Sublime Text package manager that makes it exceedingly simple to find, install and keep packages up-to-date.
      * Follow instructions [here](https://sublime.wbond.net/installation)

Javascript formatting

  * Install `JsFormat`
      * Tools > Command Palette (Shift+Ctrl+P)
      * Select Package Control: Install Package (type: pcip, then press: enter)
      * Select JsFormat package (type: jsformat, then press: enter)
      * Change Preferences > Package Settings > SublimeLinter > Settings - User to:

            {
              "format_on_save": true,
              "jsbeautifyrc_files": true
            }


Javascript linting

  * Install `SublimeLinter`
      * Tools > Command Palette (Shift+Ctrl+P)
      * Select Package Control: Install Package (type: pcip, then press: enter)
      * Select SublimeLinter package (type: sublimelinter, then press: enter)
  * Install `SublimeLinter-jshint`
      * Tools > Command Palette (Shift+Ctrl+P)
      * Select Package Control: Install Package (type: pcip, then press: enter)
      * Select SublimeLinter-jshint package (type: sublimelinter-jshint, then press: enter)
      * globally install jshint (you will need sudo/admin privileges)
          * `npm install -g jshint`
      * Preferences > Package Settings > SublimeLinter > Settings - User
          * change `"show_errors_on_save": false,` to `"show_errors_on_save": true,`

Syntax highlighting

  * Install `Jade`
      * Tools > Command Palette (Shift+Ctrl+P)
      * Select Package Control: Install Package (type: pcip, then press: enter)
      * Select Jade package (type: jade, then press: enter)
  * Install `Less`
      * Tools > Command Palette (Shift+Ctrl+P)
      * Select Package Control: Install Package (type: pcip, then press: enter)
      * Select LESS package (type: less, then press: enter)


