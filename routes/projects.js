var Project = global.db.Project;
var Item = global.db.Item;
var Snapshot = global.db.Snapshot;
var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
	var projectKey = req.param('key');
	Project.findOne({
		where : { 'key': projectKey }
	}).then(function(project) {
		if (!project) {
			res.status(404).send();
			return;
		}
		Item.findAll({
			where : [ {
				projectKey : projectKey
			} ],
			order : [ 'index', 'status' ]
		}).then(function(items) {
			res.json({
				project : project,
				items : items
			});
		}).catch(function(error) {
			console.log(error)
			res.status(500).json(error);
		});
	}).catch(function(error) {
		console.log("------------"+error);
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
		key : global.UUID.create(),
		itemIncrements : 1
	}).then(function(project) {
		res.json(project);
	}).catch(function(error) {
		res.json(error);
	});
});
router.post('/snapshot', function(req, res) {
	var projectKey = req.param('key');
	Project.findOne({
		where : { 'key': projectKey }
	}).then(function(project) {
		Item.findAll({
			where : {
				projectKey : projectKey
			},
			order : [ 'index', 'status' ]
		}).then(function(items) {
			Snapshot.create({
				projectName : project.name,
				projectKey : project.key,
				key : global.UUID.create(),
				dataJson : JSON.stringify(items)
			}).then(function(snapshot) {
				res.json({
					key : snapshot.key
				});
			}).catch(function(error) {
				console.log(error);
				res.json(error);
			});
		}).catch(function(error) {
			console.log(error)
			res.status(500).json(error);
		});
	}).catch(function(error) {
		res.status(500).json(error);
	});
});
router.get('/snapshot', function(req, res) {
	var snapshotKey = req.param('key');
	Snapshot.findOne({
		where : {'key': snapshotKey}
	}).then(function(snapshot) {
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
	}).catch(function(error) {
		res.status(500).json(error);
	});
});
module.exports = router;
