var express = require('express');
var router = express.Router();
var Task = require('../models/task');
var access = require('../libs/access');

router.use(access.check);

router.post('/', function(req, res){
	var task = new Task(req.body);

	req.checkBody('text', 'Invalid text').notEmpty().isLength(0, 500);
	req.checkBody('projectId', 'Invalid project id').notEmpty().isInt();
	// req.checkBody('userId', 'Invalid user id').isInt();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	task.id = 0;
	task.save().then(function(){
		res.send(task);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.post('/:id', function(req, res) {
	req.checkBody('id', 'Invalid id').notEmpty().isInt();
	req.checkBody('text', 'Invalid text').notEmpty().isLength(0, 500);
	req.checkBody('projectId', 'Invalid project id').notEmpty().isInt();
	// req.checkBody('userId', 'Invalid user id').isInt();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	var task = new Task(req.body);
		originTask = new Task();

	originTask.get(req.body.id).then(function(){
		if (originTask.projectId != task.projectId) {
			return res.status(400).send({
				errors: {
					access: "Bad project id"
				}
			});
		}

		return task.save();
	}).then(function(){
		res.send(task);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.delete('/:id', function(req, res){
	var task = new Task();

	task.get(req.params.id).then(function(){
		return task.delete();
	}).then(function(){
		res.send();
	}).catch(function(err){
		res.status(400).send(err);
	});
});

module.exports = router;