/**
 * End to end testing task using protractor and nodemon server
 */
let $ = require('gulp-load-plugins')({lazy: true});
let protractor = require('gulp-protractor');
let webdriver_update = protractor.webdriver_update;
let nodemon = require('nodemon');
gulp.task('test', ['serve-dist'], function (cb) {
  gulp.src(['e2e/**/*.spec.js']).pipe(protractor({
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
