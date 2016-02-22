"use strict";

gulp.task("images-fancybox", function () {
    $.util.log('Creating images in ' + $.chalk.magenta(config.imgFancyboxDst) + ' ...');
    $.mkdirp(config.imgFancyboxDst);

    var dir = config.vendor.fancybox + '/dist/img/';

    return gulp.src([
        dir + "**/*.jpg",
        dir + "**/*.jpeg",
        dir + "**/*.gif",
        dir + "**/*.png"
    ])
        .pipe($.imagemin())
        .pipe($.size({title: "Images Fancybox"}))
        .pipe(gulp.dest(config.imgFancyboxDst));
});