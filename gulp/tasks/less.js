'use strict';

gulp.task('less', function () {
    var distCss = config.css,
        srcLess = config.less,
        bundle  = 'bundle.css';

    $.util.log('Creating ' + bundle + ' in ' + $.chalk.magenta(distCss) + ' ...');
    $.mkdirp(distCss);

    return gulp
        .src(srcLess + 'freelancer.less')
        .pipe(!isProd ? $.sourcemaps.init({loadMaps: true}) : $.util.noop())
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: [
                'Android 2.3',
                'Android >= 4',
                'Chrome >= 20',
                'Firefox >= 24',
                'Explorer >= 8',
                'iOS >= 6',
                'Opera >= 12',
                'Safari >= 6'
            ]
        }))
        .pipe(isProd ? $.replace('/*!', '/*') : $.util.noop())
        .pipe(isProd ? $.csso() : $.util.noop())
        .pipe($.header(banner, {pkg: pkg, dateFormat: $.dateFormat, now: new Date}))
        .pipe(!isProd ? $.sourcemaps.write() : $.util.noop())
        .pipe($.size({title: 'CSS'}))
        .pipe($.out(distCss + bundle));
});