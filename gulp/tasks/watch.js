"use strict";

gulp.task("watch", function () {
    gulp.watch(config.readMeSrc, ["readme"]);
    gulp.watch(config.package, ["readme"]);
    gulp.watch(config.jsSrc + "**/*.js", ["babel"]);
    gulp.watch(config.jsSrc + "**/*.ejs", ["babel"]);
    gulp.watch(config.jade + "**/*.jade", ["jade"]);
    gulp.watch(config.less + "**/*.less", ["less"]);
    gulp.watch(config.imgSrc + "**/*", ["images"]);
});