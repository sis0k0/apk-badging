'use strict';

const gulp = require('gulp');
const gulpJasmine = require('gulp-jasmine');
const nodemon = require('gulp-nodemon');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

gulp.task('test', () =>
    gulp.src('spec/**/*.js')
        .pipe(gulpJasmine())
);

gulp.task('nodemon', cb => {
    let started = false;

    return nodemon({
        script: 'server.js',
        env: {
            'NODE_ENV': 'development',
            'PORT': '8080'
        }
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task('lint', () => {
    return gulp.src([
                '**/*.js',
                '!node_modules/**/*' 
            ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('watch', () => {
    gulp.watch([
        '**/*.js',
        '!node_modules/**/*' 
    ], ['lint']);
});

gulp.task('default', ['lint', 'nodemon', 'watch']);