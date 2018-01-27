# Setting up a Development Environment

## Prerequisites

- Clone the repo as you see fit (whatever GUI for Git you use).
- Visual Studio 2017: https://www.visualstudio.com/vs/community (the Community version works, but if you have a different copy already try that first)
- (optional) Visual Studio Code for those times when you don't want to deal with real VS: https://code.visualstudio.com.
- The latest version of NodeJS (important, not the LTS version. If you already have NodeJS, update it: https://nodejs.org/en).
- SimpleIRCLib: https://github.com/EldinZenderink/SimpleIRCLib in 'C:\Users\USERNAME\GitHub\SimpleIRCLib'.

## Step 1: NPM packages for the win.

Firstly open your Node.js command prompt.
Now we'll install our required NPM packages (ignore any WARN messages if you get any for now):
npm install -g @angular/cli
npm install -g @angular-devkit/schematics
npm install -g @angular/core
npm install -g @angular/common
npm install -g @angular/compiler
npm install -g @angular/compiler-cli
npm install -g @angular/cdk
npm install -g @angular/router
npm install -g @angular/forms
npm install -g @angular/http
npm install -g @angular/platform-browser-dynamic
npm install -g @angular/animations
npm install -g rxjs
npm install -g zone.js
npm install -g typescript@2.6 // Version number here is important, do not install anything higher ATM.
npm install -g angular2-toaster

Exit out of the Node.js command prompt.

## Step 2: More Node goodness.

Go to the '/LittleWeebFrontend' directory.
Right click while pressing shift within that directory.
Click on "open command window here".
Run "npm install".
Exit out of the Node.js command prompt once more.
Navigate to '%appdata%/npm/node_modules' and copy the angular2-toaster folder to '/LittleWeebFrontend/node_modules'.

## Step 3: Finishing Up
Go to the '/LittleWeebFrontend' directory.
Right click while pressing shift within that directory.
Click on "Open Command window here".
Type "ng serve".

## Development environment = setup.

At this point, hopefully you're all ready to rock :D If not, try reading any errors you get on "ng serve", installing the requested packages/updating requested packages to certain version(s).
If you're still having trouble and have made sure to go back through everything once (remove all contents of '%appdata%/npm-cache', '%appdata%/npm/node_modules' & '/LittleWeebFrontend/node_modules' first before re-attempting), go create an issue with your error :)

# Future Reading: LittleWeebAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7.

Development server: Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Code scaffolding: Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
Build: Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
Running unit tests: Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
Running end-to-end tests: Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
