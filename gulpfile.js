var gulp          = require('gulp'),
    browserify    = require('gulp-browserify'),
    rename        = require('gulp-rename'),
    jshint        = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    footer        = require('gulp-footer'),
    fs            = require('fs');

gulp.task('browserifyKiwappLinea', function(){
    fs.readFile('dev/kiwappLinea/version.js', 'utf8', function (err,data) {
        var version = data.split('\'')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
      gulp.src('./dev/kiwappLinea/kiwappLinea.js')
        .pipe(browserify())
        .pipe(rename('kiwappLinea.js'))
        .pipe(footer(';'))
        .pipe(gulp.dest('.'));
    });

});

gulp.task('checkKiwappLinea', function () {
  return gulp.src(['./dev/kiwappLinea/**/*.js', './dev/utils/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(jshintStylish));
});

gulp.task('default', function(){
    gulp.run('checkKiwappLinea');
    gulp.run('browserifyKiwappLinea');
});


gulp.task('watch', function(){
    gulp.watch( './dev/**/*.js',function(evt){
        console.log(evt.path, 'changed');
        gulp.run('default');
    });
});