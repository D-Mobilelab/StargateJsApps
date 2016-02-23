
var gulp = require('gulp'),
	fs = require('fs'),
	mainBowerFiles = require('main-bower-files'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    gulpUtil = require('gulp-util'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    notifier = require('node-notifier'),
    footer = require('gulp-footer'),
 	header = require('gulp-header'),
    del = require('del'),
    webserver = require('gulp-webserver'),
    batch = require('gulp-batch'),
    watch = require('gulp-watch'),
    bower = require('gulp-bower'),
    argv = require('minimist')(process.argv.slice(2)),
    karma = require('karma'),
    buildConfig = require('./config/build.config'),
  	karmaConf = require('./config/karma.conf.js'),
    depsOrder = require('gulp-deps-order');


gulp.task('bower:install', function() {
	return bower();
});

gulp.task('build:bower', ['bower:install'], function() {
	// take all bower includes and concatenate them,
	// in a file to be included before others
	return gulp.src(buildConfig.bowerFileList)
		.pipe(concat(buildConfig.bowerAllIncludes))
		.pipe(gulp.dest(buildConfig.build));
});


gulp.task('build:src:nonotify', ['build:bower'], function() {
	return gulp.src('src/**/*.js')
        .pipe(depsOrder())
		.pipe(concat(buildConfig.distFile))
		.pipe(header(buildConfig.closureStart))
		.pipe(footer(buildConfig.closureEnd))
	    .pipe(jshint('.jshintrc'))
	    .pipe(jshint.reporter('jshint-stylish'))

	    // add bower include on top
	    .pipe(header(fs.readFileSync(buildConfig.build + buildConfig.bowerAllIncludes, 'utf8')))

	    // save non minified version to dist folder
	    .pipe(gulp.dest(buildConfig.dist))

	    // save also to demo folder
	    .pipe(gulp.dest('demo/www/js/'))

		// save minified version
	    .pipe(rename({suffix: '.min'}))
	    .pipe(uglify().on('error', gulpUtil.log))
	    .pipe(header(buildConfig.banner))
	    .pipe(gulp.dest(buildConfig.dist));
});


gulp.task('build:bowerpackage', function() {
	return gulp.src('src/**/*.js')
		.pipe(depsOrder())
		.pipe(concat(buildConfig.distFile))
		.pipe(header(buildConfig.closureStart))
		.pipe(footer(buildConfig.closureEnd))
	    .pipe(jshint('.jshintrc'))
	    .pipe(jshint.reporter('jshint-stylish'))

	    // save non minified version to dist folder
	    .pipe(gulp.dest(buildConfig.distBower))

		// save minified version	    
	    .pipe(rename({suffix: '.min'}))
	    .pipe(uglify().on('error', gulpUtil.log))
	    .pipe(header(buildConfig.banner))
	    .pipe(gulp.dest(buildConfig.distBower));
});




gulp.task('build:src', ['build:src:nonotify', 'build:bowerpackage'], function() {
	notifier.notify({ title: "Build Success", message: 'Build StargateJS completed' });
});

gulp.task('watch', function () {
    watch('src/**/*.js', batch(function (events, done) {
        gulp.start('build', done);
    }));
});


gulp.task('concatModulesInOrder', function(){
    return gulp.src("src/modules/**/*.js")
        .pipe(depsOrder())
        .pipe(concat("modules.js"))
        .pipe(gulp.dest("src/modules.js"));
});


gulp.task('lint:jshint', function() {
	return gulp.src('src/**/*.js')

		// create temporary build for linting
		.pipe(concat(buildConfig.distFile + '.lint.tmp.js'))
		.pipe(header(buildConfig.closureStart))
		.pipe(footer(buildConfig.closureEnd))
		.pipe(gulp.dest(buildConfig.build))
	    .pipe(jshint('.jshintrc'))
	    .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
	    .pipe(jshint.reporter('fail'));
});

gulp.task('watchSpec', function(){
    watch("spec/modules/*.js", batch(function (events, done) {
        gulp.start("copySpec", done);
    }));
});

gulp.task('copySpec', function(){
    return gulp.src("spec/modules/**/*.js")
        .pipe(gulp.dest("./hello/www/jasmine/spec"));
});

gulp.task('watchSrc', function(){
    watch("src/modules/**/*.js", batch(function (events, done) {
        gulp.start("copySrc", done);
    }));
});

gulp.task("copySrc", function(){
    return gulp.src("src/modules/**/*.js")
        .pipe(depsOrder())
        .pipe(concat("modules.js"))
        .pipe(gulp.dest("./hello/www/jasmine/src/"));
});

gulp.task('testondevice', ['watchSpec', 'watchSrc']);

gulp.task('default', ['build:src'] );
gulp.task('build', ['build:src'] );


gulp.task('lint', ['lint:jshint'] );
gulp.task('test', ['karma:singlerun'] );

/*
gulp.task('clean', ['demo:clean'] );


gulp.task('demo:run', ['build:src'], function(cb) {
    process.chdir(cordovaTestProjectDir);
    return cdv.run({platforms:[testPlatform], options:['--device']});
});
*/

gulp.task('karma', ['concatModulesInOrder','build'], function (done) {

	// default to don't do single run
	argv.singlerun && (karmaConf.singleRun = true);
	argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
	argv.reporters && (karmaConf.reporters = argv.reporters.trim().split(','));

	new karma.Server(karmaConf, done).start();
});

gulp.task('karma:singlerun', ['build'], function (done) {

	karmaConf.singleRun = true;
	argv.browsers && (karmaConf.browsers = argv.browsers.trim().split(','));
	argv.reporters && (karmaConf.reporters = argv.reporters.trim().split(','));

	new karma.Server(karmaConf, done).start();
});

