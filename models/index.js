var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
global.db = {
	Sequelize : Sequelize,
	sequelize : sequelize,
	Project : sequelize.import(__dirname + '/project'),
	Item : sequelize.import(__dirname + '/item'),
	Snapshot : sequelize.import(__dirname + '/snapshot')
}
sequelize.sync().complete(function(error) {
	if (!error) {
		console.log("db sync complete");
	} else {
		console.log("error occured when db sync " + error);
	}
})
module.exports = global.db;
