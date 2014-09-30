var Project = global.db.Project;
var Item = global.db.Item;
var Snapshot = global.db.Snapshot;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	var projectKey = req.param('key');
	Project.find({
		where : [ 'key = ?', projectKey ]
	}).success(function(project) {
		if (!project) {
			res.status(404).send();
			return;
		}
		Item.findAll({
			where : [ 'projectKey = ?', projectKey ],
			order : [ 'index', 'status' ]
		}).success(function(items) {
			res.json({
				project : project,
				items : items
			});
		}).error(function(error) {
			console.log(error)
			res.status(500).json(error);
		});
	}).error(function(error) {
		res.status(500).json(error);
	});
});

router.post('/', function(req, res) {
	var projectName = req.param('name');
	if (!projectName) {
		res.status(400).json({
			error : "name not found"
		});
		return;
	}
	Project.create({
		name : projectName,
		key : global.UUID.create()
	}).success(function(project) {
		res.json(project);
	}).error(function(error) {
		res.json(error);
	});
});

router.post('/snapshot', function(req, res) {
	var projectKey = req.param('key');
	Project.find({
		where : [ 'key = ?', projectKey ]
	}).success(function(project) {
		Item.findAll({
			where : [ 'projectKey = ?', projectKey ],
			order : [ 'index', 'status' ]
		}).success(function(items) {
			Snapshot.create({
				projectName : project.name,
				projectKey : project.key,
				key : global.UUID.create(),
				dataJson : JSON.stringify(items)
			}).success(function(snapshot) {
				res.json({
					key : snapshot.key
				});
			}).error(function(error) {
				console.log(error);
				res.json(error);
			});
		}).error(function(error) {
			console.log(error)
			res.status(500).json(error);
		});
	}).error(function(error) {
		res.status(500).json(error);
	});
});

router.get('/snapshot', function(req, res) {
	var snapshotKey = req.param('key');
	Snapshot.find({
		where : [ 'key = ?', snapshotKey ]
	}).success(function(snapshot) {
		if (!snapshot) {
			res.status(404).send();
			return;
		}
		res.json({
			project : {
				name : snapshot.projectName
			},
			items : JSON.parse(snapshot.dataJson)
		});
	}).error(function(error) {
		res.status(500).json(error);
	});
});

module.exports = router;
