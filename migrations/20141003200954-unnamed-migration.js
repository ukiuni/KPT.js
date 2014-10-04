module.exports = {
	up : function(migration, DataTypes, done) {
		migration.addColumn('Projects', 'itemIncrements', DataTypes.BIGINT);
		migration.addColumn('Items', 'number', DataTypes.BIGINT);
		done()
	},
	down : function(migration, DataTypes, done) {
		migration.removeColumn('Projects', 'itemIncrements', DataTypes.BIGINT);
		migration.removeColumn('Items', 'number', DataTypes.BIGINT);
		done()
	}
}
