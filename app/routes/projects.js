var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Task = require('../models/task');
var access = require('../libs/access');

router.use(access.check);

router.get('/', function(req, res) {
	Project.list.getByUserId(req.userId).then(function(data){
		res.send(data);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.get('/:id/tasks', function(req, res){
	Task.list.getByProjectId(req.params.id).then(function(data){
		res.send(data);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.post('/', function(req, res){
	req.checkBody('name', 'Invalid name').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			errors: {
				validation: errors
			}
		});
	}

	var project = new Project(req.body);

	project.id = 0;
	project.userId = req.userId;

	project.save().then(function(){
		res.send(project);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.post('/:id', function(req, res){
	req.checkBody('name', 'Invalid name').notEmpty();
	req.checkBody('id', 'Invalid id').notEmpty().isInt();
	req.checkBody('userId', 'Invalid userId').isInt();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			errors: {
				validation: errors
			}
		});
	}

	var project = new Project(req.body),
		originProject = new Project();

	originProject.get(req.body.id).then(function(){
		if (project.userId != originProject.userId) {
			return res.status(400).send({
				errors: {
					access: "Bad user id"
				}
			});
		}

		return project.save();
	}).then(function(){
		res.send(project);
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.delete('/:id/delete', function(req, res){
	var project = new Project();

	project.get(req.params.id).then(function(){
		return project.delete();
	}).then(function(){
		return Task.list.deleteByProjectId(project.id);
	}).then(function(data){
		res.send();
	}).catch(function(err){
		res.status(400).send(err);
	});
});

router.post('/:id/sort', function(req, res){
	if (!req.body.tasksOrder || !Array.isArray(req.body.tasksOrder)) {
		return res.status(400).send({
			errors: {
				validation: [{
					param: 'tasksOrder',
					msg: 'Invalid task order'
				}]
			}
		});
	}

	Task.sort(req.body.tasksOrder).then(function(){
		res.send();
	}).catch(function(err){
		res.status(400).send(err);
	});
});

module.exports = router;
