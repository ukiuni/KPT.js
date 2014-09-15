var Project = global.db.Project;

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	Project.create({
		name : req.query.name,
		key : global.UUID.create()
	}).success(function(project) {
		res.json(project);
	}).error(function(error) {
		res.json(error);
	});
});

module.exports = router;