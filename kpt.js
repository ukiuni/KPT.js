var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./models');
var projectController = require('./routes/projects');
var itemsController = require('./routes/items');
var socketController = require('./socket');
global.UUID = require('node-uuid');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/projects', projectController);
app.use('/items', itemsController);

var execfunc = []
db.sequelize.sync().then(() => {
		var server = http.Server(app);
		global.io = require('socket.io')(server);
		global.io.on('connection', socketController);
		server.listen(app.get('port'), function() {
			console.log('Express server listening on port ' + app.get('port'))
		});
		execfunc.push(function() {
			server.close();
		});
	}).catch(error => console.log("error on initialize " + error));
global.UUID.create = function() {
	return UUID.v4().split('-').join('');
}
module.exports = {
	close : function() {
		for ( var i in execfunc) {
			execfunc[i]();
		}
	}
};
