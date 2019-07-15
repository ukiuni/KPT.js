var Project = global.db.Project;
var Item = global.db.Item;
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/../config/config.json')[env];
var express = require('express');
var router = express.Router();
router.post('/', function(req, res) {
	Project.findOne({
		where : {'key': req.body.projectKey}
	}).then(function(project) {
		if (!project) {
			res.status(404).send();
			return;
		}
		project.increment({
			itemIncrements : 1
		}).then(function(project) {
			Item.create({
				projectKey : project.key,
				key : global.UUID.create(),
				status : req.body.status,
				index : parseInt(req.body.index),
				number : project.itemIncrements
			}).then(function(item) {
				res.json(item);
			}).catch(function(error) {
				console.log("error = " + error);
				res.status(500).json(error);
			});
		}).catch(function(error) {
			console.log("error = " + error);
			res.status(500).json(error);
		});
	}).catch(function(error) {
		console.log("error = " + error);
		res.status(500).json(error);
	});
});
router.put('/', function(req, res) {
	var requestItem = req.body;
	Item.findOne({
		where : {
			key : requestItem.key
		}
	}).then(function(item) {
		if (null == item) {
			res.json({message:"item is null"});
			return;
		}
		item.title = requestItem.title;
		item.description = requestItem.description;
		item.status = parseInt(requestItem.status);
		item.index = parseInt(requestItem.index);
		item.save().then(function(item) {
			res.json(item);
			sendEvent(item.projectKey, "update", item);
		}).catch(function(error) {
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
	}).then(function(items) {
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
			sortItem.save().then(function() {
			}).catch(function(err) {
				console.log("err = " + err)
			});
		}
		Item.update(movedItem, {
			key : movedItem.key
		}).then(function() {
		}).catch(function(err) {
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
		Item.findOne({
			where : {
				key : item.key
			}
		}).then(function(findedItem) {
			if (null == findedItem) {
				return;
			}
			findedItem.destroy().then(function() {
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
