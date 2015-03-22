var db = require('../libs/db');
var Q = require('q');
var whatType = require('whatType');

var Task = function(options) {
	options = options || {};

	this.id = options.id || 0;
	this.projectId = options.projectId || 0;
	this.text = options.text || '';
	this.sort = options.sort || 0;
	this.complete = options.complete || 0;
	this.deadline = options.deadline || 0;
};

Task.prototype.schema = {
	id: "number",
	projectId: "number",
	text: "string",
	sort: "number",
	complete: "number",
	deadline: "string"
};

Task.list = {};

Task.prototype.get  = function(id) {
	var task = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn.where('id', id).get('tasks', function(err, result, fields){
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return task.reject({
					error: "Cannot get task"
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

			task.resolve();
		});
	});

	return task.promise;
};

Task.prototype.save = function() {
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

			conn.insert('tasks', saveData, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date(),  err.message, err.stack);
					return save.reject({
						error: 'Cannot create task'
					});
				}

				self.id = info.insertId;
				save.resolve();
			});
		};

		var update = function() {
			conn.where('id', self.id).update('tasks', self, function(err, info){
				conn.releaseConnection();

				if (err) {
					console.error(new Date() + ':' + err.stack);
					return save.reject({
						error: 'Cannot update task'
					});
				}

				save.resolve();
			})
		};

		self.id > 0 ? update() : create();
	});

	return save.promise;
};

Task.prototype.delete = function() {
	var task = Q.defer(),
		self = this;

	db.getConnection(function(conn){
		conn.where('id', self.id).delete('tasks', function(err){
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return task.reject({
					error: "Cannot delete task"
				});
			}

			task.resolve();
		});
	});

	return task.promise;
};

Task.list.getByProjectId = function(projectId) {
	var task = Q.defer();

	db.getConnection(function(conn){
		if (projectId === undefined) {
			conn.releaseConnection();

			return task.reject({
				error: "projectId is not defined"
			});
		}

		conn
			.where("projectId", projectId)
			.order_by('sort asc')
			.get('tasks', function(err, result, fields) {
				conn.releaseConnection();

				if (err) {
					console.error(new Date(), err.message, err.stack);
					return task.reject({
						error: "Taskt bad request"
					});
				}

				task.resolve(result);
			});
	});

	return task.promise;
};

Task.list.deleteByProjectId = function(projectId) {
	var del = Q.defer();

	db.getConnection(function(conn){
		conn.where('projectId', projectId).delete('tasks', function(err) {
			conn.releaseConnection();

			if (err) {
				console.error(new Date(), err.message, err.stack);
				return del.reject({
					error: "Cannot delete tasks in project"
				});
			}

			del.resolve();
		});
	});

	return del.promise;
};

Task.sort = function(tasksIds) {
	var sort = Q.defer();

	db.getConnection(function(conn){
		var panic = function(err) {
			conn.releaseConnection();

			sort.reject({
				error: err
			});
		};

		var isSameProject = function(projectIds) {
			for (var i in projectIds) {
				if (projectIds[i] !== projectIds[0]) {
					return false;
				}
			}

			return true;
		};

		var isInt = function(n){
			return Number(n) === n && n % 1 === 0;
		};

		for (var i in tasksIds) {
			if (!isInt(tasksIds[i])) {
				return panic('Task ids mus be array of integers');
			}
		}

		// check all of them has the same project id
		conn.where('id', tasksIds).get('tasks', function(err, tasks){
			if (err) {
				console.error(new Date(), err.message, err.stack);
				return panic('Cannot get tasks');
			}

			var projectIds = [];
			tasks.forEach(function(item){
				projectIds.push(item.projectId);
			});

			if (!isSameProject(projectIds)) {
				return panic('Tasks belong to different projects');
			}

			var query = 'UPDATE tasks SET sort = CASE id';

			tasksIds.forEach(function(item, i){
				query += ' WHEN ' + item + ' THEN ' + i;
			});

			query += ' END WHERE id IN (' + tasksIds.join(', ') + ')';

			conn.query(query, function(err, info){
				if (err) {
					console.error(new Date(), err.message, err.stack);
					return panic('Cannot update order');
				}

				conn.releaseConnection();
				sort.resolve();
			});
		});
	});

	return sort.promise;
};

module.exports = Task;