var Project = global.db.Project;
var Item = global.db.Item;
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/../config/config.json')[env];
var express = require('express');
var router = express.Router();
router.post('/', function(req, res) {
	Project.find({
		where : [ 'key = ?', req.body.projectKey ]
	}).success(function(project) {
		if (!project) {
			res.status(404).send();
			return;
		}
		project.increment({
			itemIncrements : 1
		}).success(function(project) {
			Item.create({
				projectKey : project.key,
				key : global.UUID.create(),
				status : req.body.status,
				index : parseInt(req.body.index),
				number : project.itemIncrements
			}).success(function(item) {
				res.json(item);
			})["error"](function(error) {
				console.log("error = " + error);
				res.status(500).json(error);
			});
		})["error"](function(error) {
			console.log("error = " + error);
			res.status(500).json(error);
		});
	})["error"](function(error) {
		console.log("error = " + error);
		res.status(500).json(error);
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
			res.json({message:"item is null"});
			return;
		}
		item.title = requestItem.title;
		item.description = requestItem.description;
		item.status = parseInt(requestItem.status);
		item.index = parseInt(requestItem.index);
		item.save().success(function(item) {
			res.json(item);
			sendEvent(item.projectKey, "update", item);
		})["error"](function(error) {
			res.json(error);
		});
	})
});
router.put('/move', function(req, res) {
	var movedItem = req.body.item;
	Item.findAll({
		where : {
			projectKey : movedItem.projectKey,
			status : movedItem.status
		},
		order : [ 'index' ]
	}).success(function(items) {
		var index = 0;
		for ( var i in items) {
			var sortItem = items[i];
			if (sortItem.key == movedItem.key) {
				continue;
			}
			if (sortItem.index >= movedItem.index) {
				index++;
			} else {
			}
			sortItem.index = index++;
			sortItem.save().success(function() {
			})["error"](function(err) {
				console.log("err = " + err)
			});
		}
		Item.update(movedItem, {
			key : movedItem.key
		}).success(function() {
		})["error"](function(err) {
			console.log("err = " + err);
		});
	});
	sendEvent(req.body.projectKey, "move", movedItem);
	res.json({
		message : "accepted"
	});
});
router['delete']('/', function(req, res) {
	if (Array.isArray(req.body)) {
		var items = req.body
	} else {
		var items = [ req.body ]
	}
	items.forEach(function(item) {
		Item.find({
			where : {
				key : item.key
			}
		}).success(function(findedItem) {
			if (null == findedItem) {
				return;
			}
			findedItem.destroy().success(function() {
				if (1 == items.length) {
					res.json({
						message : "accepted"
					});
				}
				sendEvent(item.projectKey, "delete", item);
			});
		});
	});
});
if (config.redis) {
	var redis = require('redis');
	var publisher = redis.createClient(config.redis.port, config.redis.host);
}
var sendEvent = function(projectKey, event, item) {
	if (!config.redis) {
		global.io.sockets["in"](projectKey).emit(event, item);
	} else {
		publisher.publish(projectKey, JSON.stringify({
			event : event,
			item : item
		}));
	}
}
module.exports = router;