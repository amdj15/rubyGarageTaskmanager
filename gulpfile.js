var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var plumber = require('gulp-plumber');
var beeper = require('beepbeep');
var gUtil = require('gulp-util');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge2 = require('merge2');
var angularTemplates = require('gulp-angular-templates');

var errorHandler = function(error) {
	beeper();
	gUtil.log(gUtil.colors.red(error));
};

gulp.task('buildcss', function() {
	gulp.src('frontend/less/main.less')
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(less())
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('public/css'));
});

gulp.task('jsvendors', function(){
	var path = 'frontend/js/vendors/';

	gulp.src([
		path + 'jquery-1.11.2.js',
		path + 'jquery-ui.js',
		path + 'angular-1.3.14.js',
		path + 'angular-resource.js',
		path + 'angular-ui-sortable.js',

		path + 'angular-ui-router.js',
		path + 'ui-bootstrap-tpls-0.12.1.js'
	])
	.pipe(plumber({
		errorHandler: errorHandler
	}))
	// .pipe(uglify())
	.pipe(concat('vendors.min.js'))
	.pipe(gulp.dest('public/js'));
});

gulp.task('buildjs', function(){
	merge2(
		gulp.src('frontend/js/app/**/*.js'),
		gulp.src('frontend/templates/**/*.html').pipe(angularTemplates({
			module: 'taskmanager'
		}))
	).pipe(plumber({
		errorHandler: errorHandler
	}))
	//.pipe(uglify())
	.pipe(concat('common.min.js'))
	.pipe(gulp.dest('public/js'));
});

gulp.task('default', function() {
	gulp.watch('frontend/less/**/*.less', ['buildcss']);

	gulp.watch(['frontend/js/app/**/*.js', 'frontend/templates/**/*.html'], ['buildjs']);
});