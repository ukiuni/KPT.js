var Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Item', {
		title : Sequelize.STRING,
		description : Sequelize.STRING,
		status : Sequelize.BIGINT,
		index : Sequelize.BIGINT,
		projectKey : Sequelize.STRING,
		key : {
			type : Sequelize.STRING,
			unique : true
		},
		number : Sequelize.BIGINT
	});
}
