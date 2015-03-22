var express = require('express');
var router = express.Router();
var User = require('../models/user');
var access = require('../libs/access');

router.post('/signUp', function(req, res){
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody("password", 'Invalid password').notEmpty().isLength(6, 20);

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	var user = new User({
		email: req.body.email,
		password: access.createPasswordHash(req.body.password)
	});

	user.save().then(function(){
		var cook = JSON.stringify({
			userId: user.id,
			token: access.createToken(user.password)
		});

		res.cookie('auth', cook, { maxAge : 3600 * 24 * 7 * 1000, httpOnly : true });

		res.send();
	}).catch(function(err){
		res.status(401).send(err);
	});
});

router.post('/signIn', function(req, res){
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody("password", 'Invalid password').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	var hash = access.createPasswordHash(req.body.password),
		user = new User();

	user.getByEmailPass(req.body.email, hash).then(function(){
		var cook = JSON.stringify({
			userId: user.id,
			token: access.createToken(user.password)
		});

		res.cookie('auth', cook, { maxAge : 3600 * 24 * 7 * 1000, httpOnly : true });

		res.send();
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.get('/signOut', function(req, res){
	res.cookie('auth', '', { maxAge : -1, httpOnly : true });
	res.send();
});

module.exports = router;