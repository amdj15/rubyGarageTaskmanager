var db = require('../libs/db');
var Q = require('q');
var whatType = require('whatType');

var User = function(options) {
	options = options || {};

	this.id = options.id || 0;
	this.email = options.email || '';
	this.password = options.password || '';
}

User.prototype.schema = {
	id: "number",
	email: "string",
	password: "string"
};

User.prototype.save = function() {
	var save = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		var saveData = {};

		// some validation
		for (var i in self) {
			if (self.hasOwnProperty(i)) {
				if (self.schema[i] === "number") {
					if (whatType.is(parseInt(self[i], 10)) !== "number") {
						continue;
					}
				} else {
					if (whatType.is(self[i]) !== self.schema[i]) {
						continue;
					}
				}

				saveData[i] = self[i];
			}
		}

		var create = function() {
			delete saveData.id;

			conn.insert('users', saveData, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date(),  err.message, err.stack);
					return save.reject({
						error: 'Cannot create user'
					});
				}

				self.id = info.insertId;
				save.resolve();
			});
		};

		var update = function() {
			conn.where('id', self.id).update('users', self, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date() + ':' + err.stack);
					return save.reject({
						error: 'Cannot update user'
					});
				}

				save.resolve();
			});
		};

		self.id > 0 ? update() : create();
	});

	return save.promise;
};

User.prototype.get  = function(id) {
	var user = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn.where('id', id).get('users', function(err, result, fields){
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return user.reject({
					error: "Cannot get users"
				});
			}

			if (result.length > 0) {
				result = result[0];

				for (var i in result) {
					if (self.hasOwnProperty(i)) {
						self[i] = result[i];
					}
				}
			}

			user.resolve();
		});
	});

	return user.promise;
};

User.prototype.getByEmailPass = function(email, password) {
	var user = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn
			.where('email', email)
			.where('password', password)
			.get('users', function(err, result, fields){
				conn.releaseConnection();

				if (err) {
					console.error(new Date(), err.message, err.stack);
					return user.reject({
						error: "Cannot get users"
					});
				}

				if (result.length !== 1) {
					return user.reject({
						error: "Incorrect email or password"
					});
				}

				result = result[0];

				for (var i in result) {
					if (self.hasOwnProperty(i)) {
						self[i] = result[i];
					}
				}

				user.resolve();
			});
	});

	return user.promise;
};

module.exports = User;