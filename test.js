'use strict';
/**
 * End to end testing task using protractor and nodemon server
 */
let gulp = require('gulp');
let $ = require('gulp-load-plugins')({ lazy: true });
let protractor = require('protractor');
let webdriver_update = protractor.webdriver_update;
let nodemon = require('nodemon');
var sequence = require('run-sequence');
gulp.task('test',['clean_test'], function (cb) {

  gulp.src(['.build/**/test.js']).pipe($.protractor.protractor({
    configFile: 'protractor.conf.js',
  })).on('error', function (e) {
    console.log(e);
    nodemon.emit('quit');
  }).on('end', function () {
    console.log('Protractor test ended');
    nodemon.emit('quit');
    // cb();
  });
});

let typescript = require('typescript');
gulp.task('compile_test', ['rename_template'], function () {

  let sourceFiles = [
    '**/*.po.ts',
    '**/*.spec.ts'
  ];

  var tsResult = gulp.src(sourceFiles)
    .pipe($.typescript({
      target: 'ES5',
      declarationFiles: false,
      noExternalResolve: false,
      experimentalDecorators: true
    }));
  return tsResult.pipe(gulp.dest('.build'))
});

gulp.task('generate_ts', function () {

  let sourceFiles = [
    './e2e/**/*.po.ts',
    './e2e/**/*.spec.ts'
  ];

  var tsFiles = gulp.src(sourceFiles, { read: false });
  return gulp.src('e2e/typings/tests.d.ts.template')
    .pipe($.inject(tsFiles, {
      starttag: '//{',
      endtag: '//}',
      transform: function (filePath) {
        return '/// <reference path="..' + filePath.replace('/e2e', '') + '" />';
      }
    }))
    .pipe(gulp.dest('e2e/typings'));

});

gulp.task('rename_template', ['generate_ts'], function () {
  return gulp.src('./e2e/typings/tests.d.ts.template')
    .pipe($.rename('./e2e/typings/tests.d.ts'))
    .pipe(gulp.dest('./'));
});

var concat = require('gulp-concat');
gulp.task('create_test', ['compile_test'], function () {
  let sourceFiles = [
    './.build/e2e/**/*.po.js',
    './.build/e2e/**/*.spec.js'
  ];
  return gulp.src(sourceFiles)
    .pipe(concat('test.js'))
    .pipe(gulp.dest('.build/e2e/'));
});

var del = require('del');
gulp.task('clean_test', function (done) {
  del('./.build/e2e/', true);
  sequence('create_test', 'serve-dist', done);
});
