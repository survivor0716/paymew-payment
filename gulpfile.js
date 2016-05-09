var gulp = require('gulp');
var pkg = require('./package.json');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var jshint = require('gulp-jshint');
var spawn = require('child_process').spawn;
var del = require('del');

//加载gulp-load-plugins插件，并马上运行它
//var plugins = require('gulp-load-plugins')();

var scriptFiles = 'app/js/**/*.js';

gulp.task('clean', function () {
  del('./dist');
});

gulp.task('compile', function () {
  // concat all scripts, minify, and output
  gulp.src(scriptFiles, {base: 'app'})
    .pipe(minify({
      ext:{
        src:'-debug.js',
        min:'.min.js'
      },
      exclude    : ['vendor'],
      noSource   : true,
      ignoreFiles: []
    }))
    //.pipe(concat(pkg.name + '_' + pkg.version + ".js"))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function () {
  // lint our scripts
  gulp.src(scriptFiles)
    .pipe(jshint())
    .pipe(jshint.reporter());

  // run our tests
  spawn('npm', ['test'], {stdio: 'inherit'});
});

gulp.task('default', function () {
  gulp.run('test', 'clean', 'compile');
  gulp.watch(scriptFiles, function () {
    gulp.run('test', 'clean', 'compile');
  });
});

gulp.task('myTest', ['clean', 'compile']);