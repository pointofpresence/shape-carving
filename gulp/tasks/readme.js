"use strict";

gulp.task("readme", function () {
    $.util.log('Creating READ.ME in ' + $.chalk.magenta(config.root) + ' ...');

    return gulp.src(config.root + config.readMeSrc)
        .pipe($.template({
            name:        pkg.name || "Unknown",
            title:       pkg.title || "Unknown",
            description: pkg.description || "Unknown",
            author:      pkg.author || "Unknown",
            repository:  pkg.repository || "Unknown",
            version:     pkg.version || "Unknown",
            license:     pkg.license || "Unknown"
        }))
        .pipe($.size({title: "READ.ME"}))
        .pipe($.out(config.root + config.readMeDst));
});
