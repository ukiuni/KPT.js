var Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Snapshot', {
		projectName : Sequelize.STRING,
		projectKey : Sequelize.STRING,
		key : {
			type : Sequelize.STRING,
			unique : true
		},
		dataJson : Sequelize.STRING
	});
}
