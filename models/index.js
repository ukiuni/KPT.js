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
sequelize.sync().then(() => {
		console.log("db sync complete");
	}).catch(error => {
		console.log("error occured when db sync " + JSON.stringify(error));
	});
module.exports = global.db;
