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
 * ** dist、tmp削除コマンド
 * 
 * $ gulp del
 * 
 * ---------------------------------------------------------------------- */

/*
 * init package
 */
var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var data = require('gulp-data');


/*
 * path
 */
var path = {
  src: 'src/',
  dist: 'dist/',
  tmp: 'tmp/',
  html_src: 'src/hbs/',
  scss_src: 'src/scss/',
  js_src: 'src/js/',
  img_src: 'src/img/',
  sprite_src: 'src/sprite/'
};


/*
 * delete
 */
var del = require('del');
gulp.task('del', function () {
  del(path.tmp);
  del(path.dist);
});


/*
 * sprite
 */
var spritesmith = require('gulp.spritesmith');
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
var sass = require('gulp-sass');
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
var autoprefixer = require('gulp-autoprefixer');
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
var csscomb = require('gulp-csscomb');
gulp.task('csscomb', function () {
  gulp.src(path.tmp + 'css/all.css')
    .pipe(plumber())
    .pipe(csscomb())
    .pipe(gulp.dest(path.tmp + 'css/'));
});

// csso
var csso = require('gulp-csso');
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
var concat = require('gulp-concat');
gulp.task('concat', function () {
  // js
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(path.tmp + 'js/'));
});

// uglify
var uglify = require('gulp-uglify');
gulp.task('uglify', function () {
  return gulp.src(path.tmp + 'js/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(path.dist + 'js/'));
});

// jshint
var jshint = require('gulp-jshint');
gulp.task('jshint', function () {
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('eslint', function () {
  return gulp.src(path.js_src + 'all/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


/*
 * html
 */
// assemble
var assemble = require('assemble');
assemble.data([path.html_src + 'data/**/*.{json,yml}']);
//assemble.helper(path.html_src + 'helper/**/*.js');
assemble.partial(path.html_src + 'include/**/*.hbs');
assemble.layout(path.html_src + 'layout/**/*.hbs');
gulp.task('html', function() {
  gulp.src(path.html_src + 'html/**/*.hbs')
    .pipe(plumber())
    .pipe(rename(function (path) {
      path.extname = '.html'
    }))
    .pipe(gulp.dest(path.dist));
});
gulp.task('assemble', function() {
  assemble.data([path.html_src + 'data/**/*.{json,yml}']);
//  assemble.helper(path.html_src + 'helper/**/*.js');
  assemble.partial(path.html_src + 'include/**/*.hbs');
  assemble.layout(path.html_src + 'layout/**/*.hbs');
  gulp.run('html');
});


/*
 * copy
 */
gulp.task('copy', function () {
  return gulp.src(
    [
      path.js_src + 'lib.js',
      path.img_src + '**/*'
    ],
    {base: path.src}
  )
    .pipe(plumber())
    .pipe(gulp.dest(path.dist));
});


/*
 * watch
 */
var connect = require('gulp-connect');
gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});
gulp.task('watch', function () {
  gulp.watch(path.scss_src + '**/*.scss', ['build:css']);
  gulp.watch(path.js_src + '**/*.js', ['build:js']);
  gulp.watch(path.html_src + '**/*.hbs', ['build:html']);
  gulp.watch(path.img_src + '**/*.hbs', ['local']);
  gulp.watch('Gulpfile.js', ['local']);
});


/*
 * task manage
 */
// build:css
gulp.task('build:css', function () {
  gulpSequence('sass', 'autoprefixer', 'csscomb', 'csso')();
});

// build:js
gulp.task('build:js', function () {
  gulpSequence('concat', 'uglify', 'jshint')();
});

// build:html
gulp.task('build:html', function () {
  gulpSequence('assemble')();
});

// build:copy
gulp.task('build:copy', function () {
  gulpSequence('copy')();
});

// test
gulp.task('test', function () {
  gulpSequence('jshint', 'eslint')();
});

// reload
gulp.task('reload', function () {
  connect.reload();
});

// build
gulp.task('build', function () {
  gulpSequence(['build:css', 'build:js', 'build:html', 'build:copy'], 'reload')();
});

// default
gulp.task('default', function () {
  gulpSequence('build')();
});


/*
 * option task
 */
// local
gulp.task('local', function () {
  gulpSequence('build')();
});

// dev
gulp.task('dev', function () {
  gulpSequence('build')();
});
