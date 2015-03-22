var db = require('../libs/db');
var Q = require('q');
var whatType = require('whatType');

var Project = function(options) {
	options = options || {};

	this.id = options.id || 0;
	this.userId = options.userId || 0;
	this.name = options.name || "New project";
};

Project.prototype.schema = {
	id: "number",
	userId: "number",
	name: "string"
};

Project.prototype.get  = function(id) {
	var project = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn.where('id', id).get('projects', function(err, result, fields){
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return project.reject({
					error: "Cannot get project"
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

			project.resolve();
		});
	});

	return project.promise;
};

Project.prototype.save = function() {
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

			conn.insert('projects', saveData, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date(),  err.message, err.stack);
					return save.reject({
						error: 'Cannot create project'
					});
				}

				self.id = info.insertId;
				save.resolve();
			});
		};

		var update = function() {
			conn.where('id', self.id).update('projects', self, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date() + ':' + err.stack);
					return save.reject({
						error: 'Cannot update project'
					});
				}

				save.resolve();
			});
		};

		self.id > 0 ? update() : create();
	});

	return save.promise;
};

Project.prototype.delete = function() {
	var del = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn.where('id', self.id).delete('projects', function(err){
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return del.reject({
					error: "Cannot delete project"
				});
			}

			del.resolve();
		});
	});

	return del.promise;
};

Project.list = {};

Project.list.getByUserId = function(userId) {
	var projects = Q.defer();

	db.getConnection(function(conn){
		if (userId === undefined) {
			conn.releaseConnection();

			return projects.reject({
				error: "userId is not defined"
			});
		}

		conn
			.where("userId", userId)
			.get('projects', function(err, result, fields) {
				conn.releaseConnection();

				if (err) {
					console.error(new Date(), err.message, err.stack);
					return projects.reject({
						error: "Projects bad request"
					});
				}

				projects.resolve(result);
			});
	});

	return projects.promise;
};

module.exports = Project;