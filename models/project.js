var Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Project', {
		name : Sequelize.STRING,
		key : {
			type : Sequelize.STRING,
			unique : true
		}
	});
}
