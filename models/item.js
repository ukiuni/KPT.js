var Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Item', {
		name : Sequelize.STRING,
		status : Sequelize.BIGINT,
		index : Sequelize.BIGINT,
		projectKey : Sequelize.STRING,
		key : {
			type : Sequelize.STRING,
			unique : true
		}
	});
}
