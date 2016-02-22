"use strict";

var through2   = require('through2'),
    browserify = require('browserify');

gulp.task("babel", function () {
    var bundle = 'bundle.js';

    $.util.log('Creating ' + bundle + ' in ' + $.chalk.magenta(config.jsDst) + ' ...');
    $.mkdirp(config.jsSrc);

    return gulp
        .src(config.jsSrc + "index.js")
        .pipe(through2.obj(function (file, enc, next) {
            browserify(file.path, {debug: !isProd})
                .transform(require('babelify'))
                .bundle(function (err, res) {
                    if (err) {
                        return next(err);
                    }

                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end');
        })
        .pipe($.rename(bundle))
        .pipe(isProd ? $.uglify() : $.util.noop())
        .pipe($.header(banner, {pkg: pkg, dateFormat: $.dateFormat, now: new Date}))
        .pipe($.size({title: "JS"}))
        .pipe(gulp.dest(config.jsDst));
});