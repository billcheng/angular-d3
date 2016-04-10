"use strict";

var gulp = require("gulp"),
    rename = require("gulp-rename"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify");

var paths = {
    source: "./src/",
    dist: "./dist/"
};

paths.js = paths.source + "*.js";
paths.minJs = paths.source + "*.min.js";
paths.css = paths.source + "*.css";
paths.minCss = paths.source + "*.min.css";

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs])
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist));
});

gulp.task("min", ["min:js", "min:css"]);