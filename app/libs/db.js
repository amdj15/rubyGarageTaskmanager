var Db = require('mysql-activerecord');
var url = require('url');
var conf;

// heroku hack !!!
if (process.env.DATABASE_URL) {
	var parseENV = url.parse(process.env.DATABASE_URL);

	conf = {
		mysql: {
			host: parseENV.host,
			user: parseENV.auth.split(':')[0],
			pass: parseENV.auth.split(':')[1],
			database: parseENV.pathname.replace('/', ''),
			port: 3306,
			connectionLimit: 5
		}
	};
} else {
	conf = require('../conf/database.json');
}

var pool = new Db.Pool({
	server: conf.mysql.host,
	username: conf.mysql.user,
	password: conf.mysql.pass,
	database: conf.mysql.database,
	port: conf.mysql.port,
	connectionLimit : conf.mysql.connectionLimit
});

/**
 * Get DB connection from pool
 *
 * @author Anton <amdj15@gmail.com>
 *
 * @param  {Function} callback
 */
var getConnection = function(callback) {
	pool.getNewAdapter(function(db) {
		callback(db);
	});
};

module.exports = {
	getConnection: getConnection
};