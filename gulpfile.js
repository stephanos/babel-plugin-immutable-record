const del = require('del');
const gulp = require('gulp');
const path = require('path');

const flow = require('gulp-flowtype');
const gutil = require('gulp-util');
const isparta = require('isparta');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const espower = require('gulp-espower');
const istanbul = require('gulp-istanbul');
const coveralls = require('gulp-coveralls');
const sourcemaps = require('gulp-sourcemaps');

var daemon = false
require("babel-core/register");


function handleError(err) {
  gutil.log(err);
  if (!daemon) {
    process.exit(1);
  }
}


gulp.task('clean', function(done) {
  del.sync(['dist', 'coverage']);
  done();
});

gulp.task('build', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', handleError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('build-test', function () {
  return gulp.src(['src/fixtures/*/output.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', handleError)
    .pipe(rename(function (path) {
      path.extname = '.es6.js';
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('typecheck', function() {
  return gulp.src(['src/**/*.js', '!src/fixtures/**/input.js'])
    .pipe(flow({
      abort: !daemon,
    }));
});

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', '!src/fixtures/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!daemon, eslint.failAfterError()));
});

gulp.task('unit-test', function (done) {
  gulp.src(['src/**/*.js', '!src/**/*.spec.js', '!src/fixtures/**/*.js'])
    .pipe(istanbul({
      instrumenter: isparta.Instrumenter,
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(['src/**/*.spec.js', '!src/types.spec.js'], {read: false})
        .pipe(mocha({
          ui: 'bdd',
          reporter: 'dot',
        }))
        .on('error', (err) => {
          handleError(err);
          done();
        })
        .pipe(istanbul.writeReports({
          dir: 'coverage',
          reportOpts: {dir: 'coverage'},
          reporters: ['lcov']
        }))
        .on('end', done);
    });
});

gulp.task('coveralls', function (done) {
  if (!process.env.CI) {
    return done()
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls())
    .pipe(require('gulp-callback')(done));
});


gulp.task('watch', function () {
  gulp.watch(['src/**/*.js'],
    gulp.series('package'));
});

gulp.task('_daemon', (done) => {
  daemon = true
  done()
})


gulp.task('package',
  gulp.series('build', 'build-test', 'lint', 'typecheck', 'unit-test', 'coveralls'));

gulp.task('dev',
  gulp.series('_daemon', 'clean', 'package', 'watch'));

gulp.task('default',
  gulp.series('clean', 'package'));
