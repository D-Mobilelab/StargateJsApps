#! /usr/bin/env node
/* http://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm */
var version = require("./../package.json").version;
var shell = require("shelljs");

shell.exec("jsdoc -R README.md src/modules -d dist/"+version);

