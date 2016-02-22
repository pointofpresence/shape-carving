"use strict";

gulp.task("images", function () {
    $.util.log('Creating images in ' + $.chalk.magenta(config.imgDst) + ' ...');
    $.mkdirp(config.imgDst);

    return gulp.src([
        config.imgSrc + "**/*.jpg",
        config.imgSrc + "**/*.jpeg",
        config.imgSrc + "**/*.gif",
        config.imgSrc + "**/*.png"
    ])
        .pipe($.imagemin())
        .pipe($.size({title: "Images"}))
        .pipe(gulp.dest(config.imgDst));
});