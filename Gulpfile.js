var gulp = require("gulp");
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var ts = require("gulp-typescript");
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var server = require('gulp-server-livereload');
var mainBowerFiles = require('gulp-main-bower-files');
var concat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var usemin = require('gulp-usemin');
var merge = require('merge2');
var _if = require('gulp-if');
var flatten = require('gulp-flatten');

var files = {

    all: "app/**/*",
    vendorjs: {
        name: "vendor.js",
        path: "app/js/vendor.js"
    },
    bower: {
        file: "./bower.json",
    },
    app: {
        dir: "app/",
        index: "app/index.html"
    },
    js: {
        alljs: "app/js/**/*.js",
        all: "app/js/**/*",
        dir: "app/js/",
        definition: "app/js/definitions/"

    },
    typscripts: {
        all: "app/typescripts/**/*.ts",
        dir: "app/typescripts/",
    },
    sass: {
        all: "app/sass/**/*",
        allscss: "app/sass/**/*.scss",
        dir: "app/sass/"
    },
    styles: {
        all: "app/styles/**/*",
        allcss: "app/styles/**/*.css",
        dir: "app/styles/",
    },
    html: {
        all: "app/**/*.html"
    },
    dist: {
        all: "dist/**/*",
        dir: "dist",
        js: {
            dir: "dist/js/"
        }
    },
    sourcemaps: {
        dir: "."
    },

    ignore: function (path) {
        return "!" + path;
    },

};

gulp.task("clean:js", function () {
    return del(files.js.all);
});

gulp.task("clean:dist", function () {
    return del(files.dist.all);
});

gulp.task("compile:typescripts", function () {
    var tsResult = gulp.src(files.typscripts.all)
        .pipe(ts({
            sortOutput: true,
            declaration: true,
            noExternalResolve: false
        }));

    return merge([
        //tsResult.dts
        //    .pipe(gulp.dest(files.js.definition)),
        tsResult.js
            .pipe(gulp.dest(files.js.dir))
    ]);
});

gulp.task("compile:sass", function () {
    return gulp.src(files.sass.all)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(files.styles.dir));
});

gulp.task("bower:js", function () {
    var filterJS = gulpFilter(['**/*.js'], {restore: true});
    return gulp.src(files.bower.file)
        .pipe(sourcemaps.init({
            inlineSourceMap: false
        }))
        .pipe(mainBowerFiles("**/*.js"))
        .pipe(filterJS)
        .pipe(concat(files.vendorjs.name))
        .pipe(sourcemaps.write(files.sourcemaps.dir))
        .pipe(filterJS.restore)
        .pipe(gulp.dest(files.js.dir));
});

gulp.task("minify:js", function () {
    return gulp.src(files.js.alljs)
        .pipe(uglify())
        .pipe(gulp.dest(files.dist.js.dir));
});

gulp.task("minify:html", function () {
    return gulp.src(files.html.all)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(files.dist.dir))
});

gulp.task("copy:allToDist", function () {
    return gulp.src([files.all, files.ignore(files.typscripts.dir), files.ignore(files.typscripts.dir+"**"),
            files.ignore(files.js.dir),files.ignore(files.js.dir+"**"), files.ignore(files.sass.dir),files.ignore(files.sass.dir+"**")])
        .pipe(gulp.dest(files.dist.dir));
});

gulp.task("copy:vendorjs", function () {
    return gulp.src(files.vendorjs.path)
        .pipe(uglify())
        .pipe(gulp.dest(files.dist.js.dir));
});

gulp.task("copy:vendorimages", function () {
    return gulp.src("./bower_components/**/*.svg")
        .pipe(flatten())
        .pipe(gulp.dest("./app/images"));
});

gulp.task('mergejsfiles', function () {
    return gulp.src(files.app.index)

        .pipe(usemin({
            js: [
                sourcemaps.init({inlineSourceMap: false}),
                uglify({mangle:false}),
                sourcemaps.write(files.sourcemaps.dir)
            ]
        }))
        .pipe(_if('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest(files.dist.dir));
});

gulp.task("watch", ['compile:typescripts'], function () {
    gulp.watch(files.typscripts.all, ['compile:typescripts']);
    gulp.watch(files.sass.allscss, ['compile:sass']);

});

gulp.task("build", [], function (callback) {
    runSequence("clean:dist", "clean:js", "compile:typescripts", "bower:js", "compile:sass", "copy:vendorimages","copy:allToDist", "mergejsfiles", "copy:vendorjs", callback);
});

gulp.task("serve", ["watch", "compile:typescripts", "bower:js", "compile:sass","copy:vendorimages"], function () {
    gulp.src(files.app.dir)
        .pipe(server({
            defaultFile: "index.html",
            livereload: {
                enable: true,
                filter: function (filename, cb) {
                    cb(!/\.scss$|\.ts$|\.ts$|node_modules/.test(filename));
                },
            },
            open: true
        }));
});




