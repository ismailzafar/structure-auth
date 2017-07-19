var execSync               = require('child_process').execSync,
    eslint                 = require('gulp-eslint'),
    gulp                   = require('gulp'),
    mocha                  = require('gulp-mocha'),
    path                   = require('path'),
    spawn                  = require('child_process').spawn

gulp.task('lint', function () {

    return gulp.src([
      'src/**/*.js',
      'test/**/*.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())

})

gulp.task('mocha', function(done) {

  gulp
    .src([
      './test/setup.js',
      './test/integration/routes/**.js',
      './test/integration/middleware/**.js'
    ], {read: false})
    .pipe(mocha({reporter: 'spec'}))
    .on('end', function () {

      process.exit()

    })
    .on('error', function (e) {
      console.error(e)
    })

})

gulp.task('stop-reqlite', function(done) {

  try {
    execSync('node_modules/forever/bin/forever stop node_modules/reqlite/lib/node.js --port-offset 1 -s')
  }
  catch(e) {}
  process.exit()

})

gulp.task('test', ['mocha'])

gulp.task('t', ['test'])
