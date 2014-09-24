var Item = global.db.Item;

var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	Item.create({
		projectKey : req.body.projectKey,
		key : global.UUID.create(),
		status : req.body.status,
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
			global.io.sockets.in(item.projectKey).emit("update", item);
		}).error(function(error) {
			res.json(error);
		});
	})
});

router.put('/move', function(req, res) {
	var movedItem = req.body.item;
	Item.findAll({
		where : {
			projectKey: movedItem.projectKey,
			status: movedItem.status
		},
		order : [ 'index' ]
	}).success(function(items) {
		var index = 0;
		for ( var i in items) {
			var sortItem = items[i];
			if(sortItem.key == movedItem.key){
				continue;
			}
			if(i == movedItem.index){
				index++;
			} else {
			}
		    sortItem.index = index++;
		    
			sortItem.save().success(function() {
			}).error(function(err) {
				console.log("err = "+err)
			});
		}
		Item.update(movedItem,{
			key: movedItem.key
		}).success(function() {
		}).error(function(err) {
			console.log("err = "+err);
		});
	});
	global.io.sockets.in(req.body.projectKey).emit("move", movedItem);
	res.json({
		message : "accepted"
	});
});

router['delete']('/', function(req, res) {
	if(Array.isArray(req.body)){
		var items = req.body
	} else {
		var items = [req.body]
	}
	items.forEach(function(item){
		Item.find({
			where : {
				key : item.key
			}
		}).success(function(findedItem) {
			if (null == findedItem) {
				return;
			}
			findedItem.destroy().success(function() {
				if(1 == items.length){
					res.json({
						message : "accepted"
					});
				}
				global.io.sockets.in(item.projectKey).emit("delete", item);
			});
		});
	});
});

module.exports = router;