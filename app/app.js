var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var expressValidator = require('express-validator');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.disable('etag');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

(function(routsRoot){
	var walk = function(dir) {
		var list = fs.readdirSync(dir);
		list.forEach(function(filePath) {
			filePath = dir + '/' + filePath;
			var stat = fs.statSync(filePath);
			if (stat && stat.isDirectory()) {
				walk(filePath);
			} else {
				var patt = new RegExp('.js$'),
					routePath;

				if (patt.test(filePath)) {
					file = require(filePath);
					routePath = filePath.replace(routsRoot, '');
					routePath = routePath.replace(/\.js$/, '');

					if (routePath === '/index') {
						routePath = '/';
					}

					if (file instanceof Array) {
						file.forEach(function(route){
							app.use(routePath, route);
						});
					} else {
						app.use(routePath, file);
					}
				}
			}
		});
	};

	walk(routsRoot);
})('./routes');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send( {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send( {
		message: err.message
	});
});


module.exports = app;
