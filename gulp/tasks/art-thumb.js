"use strict";

gulp.task('art-thumb', function () {
    $.util.log('Creating thumbs in ' + $.chalk.magenta(config.imgArtThumbsDst) + ' ...');
    $.mkdirp(config.imgArtThumbsDst);

    return gulp.src([
        config.imgArtSrc + "**/*.jpg",
        config.imgArtSrc + "**/*.jpeg",
        config.imgArtSrc + "**/*.gif",
        config.imgArtSrc + "**/*.png"
    ])
        .pipe($.imageResize({
            width:       260,
            height:      260,
            crop:        true,
            upscale:     false,
            imageMagick: true,
            filter:      'Box'
        }))
        .pipe($.imagemin())
        .pipe($.size({title: "Art thumbs"}))
        .pipe(gulp.dest(config.imgArtThumbsDst));
});