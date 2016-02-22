"use strict";

gulp.task("jade", function () {
    $.util.log('Creating HTML in ' + $.chalk.magenta(config.root) + ' ...');

    var opts = {
        removeComments: true
    };

    return gulp.src(config.root + config.jade + "index.jade")
        .pipe($.jade({
            pretty: !isProd,
            locals: {
                name:        pkg.name || "Unknown",
                title:       pkg.title || "Unknown",
                description: pkg.appDescription || "Unknown",
                keywords:    pkg.appKeywords || "Unknown",
                author:      pkg.author || "Unknown",
                repository:  pkg.repository || "Unknown",
                version:     pkg.version || "Unknown"
            }
        }))
        .on("error", $.notify.onError({
            message: "Jade compile error: <%= error.message %>"
        }))
        .pipe(isProd ? $.htmlmin(opts) : $.util.noop())
        .pipe($.size({title: "HTML"}))
        .pipe(gulp.dest(config.root));
});