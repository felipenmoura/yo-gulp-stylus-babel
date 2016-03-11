/* REQUIRED PACKAGES */
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    shell = require('gulp-shell'),
    jshint = require('gulp-jshint'),
    stylint = require('gulp-stylint'),
    stylus = require('gulp-stylus'),
    runSequence = require('run-sequence'),
    connect = require('gulp-connect');
const babel = require('gulp-babel');

/* CLEAN UP */
gulp.task('clean', function (done) {
	gulp.src('dist/', {read: false})
        .pipe(shell([
            'rm -rf <%= file.path %>'
        ]))
        .on('finish', done);
});

/* JS LINT */
gulp.task('jshint', function(done) {
    var failed = false;
    gulp.src(['!./src/vendors/**/*.js', './src/**/*.js'])
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
        .on('error', function(){
            failed = true;
            done('Failed validating on jshint!');
        })
        .on('finish', function(){
            if(!failed){
                done();
            }
        });
});

/* CSS LINT (STYLUS) */
gulp.task('stylint', function (done) {
    var failed = false;
    gulp.src(['!src/vendors/**/*.styl', 'src/**/*.styl'])
        .pipe(stylint({config: '.stylintrc'}))
        .pipe(stylint.reporter())
        .pipe(stylint.reporter('fail', {failOnWarning: true}))
        .on('error', function(){
            failed = true;
            done('Failed validating on stylint');
        })
        .on('finish', function(){
            if(!failed){
                done();
            }
        });;
});

/* SHOW RESULT */
gulp.task('show', function () {
	return gulp.src('dist/', {read: false})
        .pipe(shell([
            "tree dist/ 2>/dev/null || echo ''"
        ]))
        .on('finish', function(){
            console.log('DONE, watching now...');
        });
});

/* CSS (STYLUS) */
gulp.task('styl', function () {
    return gulp.src('src/styles/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true,
            'include css': true
        }))
        .on('error', function(err){
            console.error(err);
            this.emit('end');
        })
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles/'));
});

/* JS (BABEL) */
var minify = require('gulp-minify'),
    browserify = require('gulp-browserify'),
    watchify = require('watchify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    concat = require('gulp-concat'),
    rollup = require('gulp-rollup');

gulp.task('babel', function () {
    return gulp.src('src/scripts/main.js')
        .pipe(sourcemaps.init())
        .pipe(rollup({ external: ['request', 'cheerio'] }))
        .on('error', function(err){
            console.log(err);
        })
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/scripts/'));
});
//
//gulp.task('XXXXX', () => {
//    return gulp.src ([
//            'src/scripts/**/*.js',
//            'src/scripts/main.js'
//        ])
//        .pipe(sourcemaps.init())
//        .pipe(babel({
//            presets: ['es2015'],
//        "plugins": [
//            [
//                "transform-es2015-modules-commonjs", {
//                    "allowTopLevelThis": true
//                }
//            ]
//        ]
//        }))
//        .pipe(concat('main.js'))
//        .pipe(sourcemaps.write('.'))
//        .pipe(gulp.dest('dist/scripts'));
//});

/* STATIC (COPY html, images, videos, etc) */
gulp.task('vendors', ()=>{
    return gulp.src(['!src/vendors/**/*.styl', 'src/vendors/**/*'])
        .pipe(gulp.dest('dist/'));
});
gulp.task('static', ['vendors'], ()=>{
    return gulp.src('src/public/**/*')
        .pipe(gulp.dest('dist/'));
});

/* LIVE RELOAD */
gulp.task('reload', function () {
    gulp.src('./dist/*.html')
        .pipe(connect.reload());
    console.log('reloading');
});

/*  WATCH */
gulp.task('watch', function(){
    gulp.watch(['src/**/*'], ['build']);
});

/* SERVER */
gulp.task('webserver', function() {
    connect.server({
        root: 'dist',
        port: 8080,
        livereload: true
    });
});

/* THEN RUN IT, BABE! */
gulp.task('build', function(done) {
  runSequence(['stylint', 'jshint'],
              'clean',
              ['styl', 'babel', 'static'],
              'show',
              'reload',
              done);
});

/* DEFINING TASKS */
gulp.task('default', ['watch', 'webserver']);
