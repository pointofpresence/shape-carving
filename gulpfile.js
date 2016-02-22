"use strict";

global.$ = require("gulp-load-plugins")();
$.dateFormat  = require("dateformat");
$.mkdirp      = require("mkdirp");
$.chalk       = require("chalk");
$.runSequence = require("run-sequence");

global.isProd = $.util.env.prod || false;
global.config = require("./gulp/config.js");
global.pkg = require("./package.json");
global.gulp = require("gulp");

global.banner = [
    '/**',
    ' * Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author %>',
    ' * <%= pkg.title %> (<%= pkg.name %>) - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.repository %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

require("require-dir")("./gulp/tasks", {recurse: true});

$.util.log('Creating dist dir in ' + $.chalk.magenta(config.dist) + ' ...');
$.mkdirp(config.dist);

gulp.task("default", function () {
    if (!isProd) {
        return $.runSequence("build", "watch");
    }

    return $.runSequence("build");
});