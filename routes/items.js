var Item = global.db.Item;

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	Item.create({
		projectKey : req.body.projectKey,
		key : global.UUID.create(),
		status : 0,
		index : parseInt(req.body.index)
	}).success(function(project) {
		res.json(project);
	}).error(function(error) {
		res.json(error);
	});
});
router.put('/', function(req, res) {
	var requestItem = req.body;
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
router.put('/sort', function(req, res) {
	var sortItems = req.body;
	for ( var i in sortItems) {
		var sortItem = sortItems[i];
		if (sortItem.key) {
			Item.update(sortItem, {
				key : sortItem.key
			}).success(function() {
			}).error(function() {
			});
		}
	}
	res.json({
		message : "accepted"
	});
});
router.delete('/', function(req, res) {
	Item.find({
		where : {
			key : req.body.key
		}
	}).success(function(item) {
		if (null == item) {
			res.json(error);
			return;
		}
		item.destroy().success(function() {
			res.json({
				message : "accepted"
			});
		});
	});
});

module.exports = router;