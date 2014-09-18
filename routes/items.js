var Item = global.db.Item;

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	console.log("######## asdfasfd = " + req.body.projectKey);
	Item.create({
		projectKey : req.body.projectKey,
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
	requestItem = req.body;
	Item.find({
		where : {
			key : requestItem.key
		}
	}).success(function(item) {
		if (null == item) {
			res.json(error);
			return;
		}
		item.title = requestItem.title;
		item.description = requestItem.description;
		item.status = parseInt(requestItem.status);
		item.index = parseInt(requestItem.index);
		item.save().success(function(item) {
			res.json(item);
		}).error(function(error) {
			res.json(error);
		});
	})
});

module.exports = router;