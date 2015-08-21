/**
 * gulp-boiler
 * 
 * ** 開発開始手順
 * 
 * $ npm install
 * $ npm install gulp.spritesmith
 * $ gulp sprite
 * $ gulp
 * 
 * ** 開発watchコマンド
 * 
 * $ gulp watch
 * 
 * ** spriteコマンド
 * 
 * $ gulp sprite
 * 
 * ** jshintコマンド
 * 
 * $ gulp test
 * 
 * ---------------------------------------------------------------------- */

var gulp = require('gulp');
var del = require('del');
var gulpSequence = require('gulp-sequence');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var csscomb = require('gulp-csscomb');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var spritesmith = require('gulp.spritesmith');
var jshint = require('gulp-jshint');
var jade = require('gulp-jade');
var data = require('gulp-data');


/*
 * path
 */
var path = {
    src: 'src/',
    dist: 'dist/',
    tmp: 'tmp/',
    html_src: 'src/jade/',
    scss_src: 'src/scss/',
    js_src: 'src/js/',
    sprite_src: 'src/sprite/'
};


/*
 * delete
 */
gulp.task('del', function () {
    del(path.tmp);
    del(path.dist);
});

/*
 * sprite
 */
gulp.task('sprite', function () {
    var spriteData = gulp.src(path.sprite_src + 'sprite-sample/*.png')
        .pipe(spritesmith({
            imgName: 'sprite-sample.png',
            cssName: 'sprite-sample.scss',
            imgPath: '../img/sprite-sample.png',
            cssFormat: 'scss',
            padding: 5
        }));
    spriteData.img.pipe(gulp.dest(path.dist + 'img/'));
    spriteData.css.pipe(gulp.dest(path.scss_src + 'all/module/'));
});


/*
 * css
 */
// sass
gulp.task('sass', function () {
    gulp.src(path.scss_src + 'all/import.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest(path.tmp + 'css/all/'))
        .pipe(rename('all.css'))
        .pipe(gulp.dest(path.tmp + 'css/'));
});


// autoprefixer
gulp.task('autoprefixer', function () {
    gulp.src(path.tmp + 'css/all.css')
        .pipe(plumber())
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'ie 7', 'ie 8', 'ie 9'],
            cascade: false
        }))
        .pipe(gulp.dest(path.tmp + 'css/'));
});


// csscomb
gulp.task('csscomb', function () {
    gulp.src(path.tmp + 'css/all.css')
        .pipe(plumber())
        .pipe(csscomb())
        .pipe(gulp.dest(path.tmp + 'css/'));
});


// csso
gulp.task('csso', function () {
    gulp.src(path.tmp + 'css/all.css')
        .pipe(plumber())
        .pipe(csso())
        .pipe(gulp.dest(path.dist + 'css/'));
});



/*
 * js
 */
// concat
gulp.task('concat', function () {
    // js
    return gulp.src(path.js_src + 'all/*.js')
        .pipe(plumber())
        .pipe(concat('all.js'))
        .pipe(gulp.dest(path.tmp + 'js/'));
});


// uglify
gulp.task('uglify', function () {
    return gulp.src(path.tmp + 'js/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(path.dist + 'js/'));
});


// jshint
gulp.task('jshint', function () {
    return gulp.src(path.js_src + 'all/*.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});



/*
 * html
 */
// jade
gulp.task('jade', function () {
    gulp.src('src/jade/html/**/*.jade')
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(path.dist));
});



/*
 * task manage
 */
// watch
gulp.task('watch', function () {
    gulp.watch('src/**/*.scss', ['build:css']);
    gulp.watch('src/**/*.js', ['build:js']);
    gulp.watch('src/**/*.jade', ['build:html']);
});

// build:css
gulp.task('build:css', function () {
    gulpSequence('sass', 'autoprefixer', 'csscomb', 'csso')();
});

// build:js
gulp.task('build:js', function () {
    gulpSequence('concat', 'uglify')();
});

// build:html
gulp.task('build:html', function () {
    gulpSequence('jade')();
});

// test
gulp.task('test', function () {
    gulpSequence('jshint')();
});

// default
gulp.task('default', gulpSequence('build:css', 'build:js', 'build:html'));