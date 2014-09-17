var Item = global.db.Item;

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	Item.create({
		projectKey : req.query.projectKey,
		key : global.UUID.create(),
		status : 0,
		index : 0
	}).success(function(project) {
		res.json(project);
	}).error(function(error) {
		res.json(error);
	});
});
router.put('/', function(req, res) {
	Item.find({
		where : {
			key : req.query.key
		}
	}).success(function(item) {
		item.title = req.query.title;
		item.description = req.query.description;
		item.status = parseInt(req.query.status);
		item.index = parseInt(req.query.index);
		item.save().success(function(item) {
			res.json(item);
		}).error(function(error) {
			res.json(error);
		});
	})
});

module.exports = router;