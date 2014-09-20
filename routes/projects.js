var Project = global.db.Project;
var Item = global.db.Item;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	var projectKey = req.param('key');
	Project.find({
		where : [ 'key = ?', projectKey ]
	}).success(function(project) {
		Item.findAll({
			where : [ 'projectKey = ?', projectKey ],
			order : [ 'index', 'status']
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

module.exports = router;