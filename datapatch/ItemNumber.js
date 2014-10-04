var Sequelize = require('sequelize');
var db = require('../models');
db.Project.findAll().success(function(projects) {
	console.log("projects size = " + projects.length);
	projects.forEach(function(project) {
		console.log("project.itemIncrements = " + project.itemIncrements);
		if (!project.itemIncrements) {
			db.Item.findAll({
				'projectKey' : project.key
			}).success(function(items) {
				var index = 0;
				items.forEach(function(item) {
					item.number = ++index;
					item.save();
				});
				project.itemIncrements = items.length + 1;
				project.save();
			}).error(function(error) {
				console.log("error " + error)
			});
		}
	});
}).error(function(error) {
	console.log("error " + error)
});