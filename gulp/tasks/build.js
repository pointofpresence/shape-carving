"use strict";

gulp.task("build", function () {
    return $.runSequence([
        "fonts",
        "images",
        "art-thumb",
        "images-fancybox",
        "babel",
        "less",
        "jade",
        "readme"
    ]);
});