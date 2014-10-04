var Sequelize = require('sequelize')
var sequelize = new Sequelize('kpt', '', '', {
	dialect : 'sqlite',
	storage : './sqlite.db'
});

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
