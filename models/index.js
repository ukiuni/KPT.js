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
module.exports = global.db;
