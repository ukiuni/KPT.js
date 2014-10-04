module.exports = {
	up : function(migration, DataTypes, done) {
		migration.createTable('Projects', {
			name : DataTypes.STRING,
			key : {
				type : DataTypes.STRING,
				unique : true
			}
		});
		migration.createTable('Items', {
			title : DataTypes.STRING,
			description : DataTypes.STRING,
			status : DataTypes.BIGINT,
			index : DataTypes.BIGINT,
			projectKey : DataTypes.STRING,
			key : {
				type : DataTypes.STRING,
				unique : true
			}
		});
		migration.addIndex('Items', [ 'projectKey' ], {
			indexName : 'ItemProjectKeyIndex'
		})
		migration.createTable('Snapshots', {
			projectName : DataTypes.STRING,
			projectKey : DataTypes.STRING,
			key : {
				type : DataTypes.STRING,
				unique : true
			},
			dataJson : DataTypes.STRING
		});
		done()
	},
	down : function(migration, DataTypes, done) {
		migration.dropAllTables()
		done()
	}
}
