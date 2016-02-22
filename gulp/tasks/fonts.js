"use strict";

gulp.task("fonts", function () {
    $.util.log('Creating fonts in ' + $.chalk.magenta(config.fonts) + ' ...');
    $.mkdirp(config.fonts);

    return gulp
        .src(config.vendor.fontAwesome + "fonts/*.*")
        .pipe($.size({title: "Fonts"}))
        .pipe(gulp.dest(config.fonts));
});