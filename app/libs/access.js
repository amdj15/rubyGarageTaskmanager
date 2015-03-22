var Q = require('q');
var db = require('./db');
var crypto = require('crypto');

var checkAccess = function(auth) {
	var deferred = Q.defer();

	db.getConnection(function(conn){
		conn
			.where('id', auth.userId)
			.get('users', function(err, result){
				conn.releaseConnection();

				if (err) {
					console.error(new Date() + ':' + err.stack);
					return deferred.reject({
						error: 'Cannot get user'
					});
				}

				if (result.length !== 1) {
					var err = {
						error: 'Bad users count'
					};

					console.error(new Date() + ':' + err.error);
					return deferred.reject(err);
				}

				var user = result[0];

				if (auth.token === module.exports.createToken(user.password, user.id)){
					deferred.resolve(user.id);
				} else {
					deferred.reject({
						error: 'Bad token'
					});
				}
			});
	});

	return deferred.promise;
};

module.exports = {
	check: function(req, res, next){
		if (!req.cookies.auth) {
			return res.status(401).send();
		}

		try {
			var cook = JSON.parse(req.cookies.auth);
		} catch(e) {
			console.error(new Date(), e.stack);
			return res.status(401).send();
		}

		checkAccess(cook).then(function(userId){
			req.userId = userId;
			next();
		}).catch(function(err){
			res.status(401).send();
		});
	},
	createToken: function(password, userId) {
		return crypto.createHash('md5').update(password + '345Ji9jjnftw93zL').digest('hex');
	},
	createPasswordHash: function(password) {
		return crypto.createHash('md5').update('fihj43vj9245JiYb8HGtyg7H' + password  + 'wer235rfd3453' + password).digest('hex');
	}
};