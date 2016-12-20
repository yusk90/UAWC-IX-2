var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    mustache = require('gulp-mustache'),
    clean = require('del'),
    params = {
        out: 'public/',
        images: 'public/images/',
        fonts: 'public/fonts/',
        css: 'public/css/',
        js: 'public/js/'
    };

gulp.task('clean', function () {
    return clean(params.out);
});

gulp.task('html', function () {
    return gulp.src('html/*.html')
        .pipe(mustache())
        .pipe(gulp.dest(params.out))
        .pipe(reload({ stream: true }));
});

gulp.task('favicon', function () {
    return gulp.src('html/favicon.ico')
        .pipe(gulp.dest(params.out))
        .pipe(reload({ stream: true }));
});

gulp.task('style', function () {
    return gulp.src('scss/style.scss')
        .pipe(sass({
          includePaths: 'node_modules'
        }))
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9']
        })]))
        .pipe(gulp.dest(params.out))
        .pipe(reload({ stream: true }));
});

gulp.task('css', function () {
    return gulp.src('css/*.css')
        .pipe(gulp.dest(params.css))
        .pipe(reload({ stream: true }));
});

gulp.task('js', function () {
    return gulp.src('js/*.js')
        .pipe(gulp.dest(params.js))
        .pipe(reload({ stream: true }));
});

gulp.task('fonts', function () {
    return gulp.src(['fonts/**/*', 'node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*'])
        .pipe(gulp.dest(params.fonts))
        .pipe(reload({ stream: true }));
});

gulp.task('server', function () {
    browserSync.init({
        server: params.out
    });
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('html', 'css', 'js', 'fonts', 'favicon', 'style')
));

gulp.task('watch', function () {
    gulp.watch('html/**/*', gulp.parallel('html'));
    gulp.watch(['scss/**/*.scss', 'scss/style.scss'], gulp.parallel('style'));
    gulp.watch('css/**/*', gulp.parallel('css'));
    gulp.watch('js/**/*', gulp.parallel('js'));
    gulp.watch('fonts/**/*', gulp.parallel('fonts'));
});

gulp.task('default', gulp.series('build', gulp.parallel('server', 'watch')));
