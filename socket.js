var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/config/config.json')[env];
if (config.redis) {
	var redis = require('redis');
	var subscriber = redis.createClient(config.redis.port, config.redis.host);
	subscriber.on("message", function(channel, messageStr) {
		var message = JSON.parse(messageStr);
		global.io.sockets["in"](channel).emit(message.event, message.item);
	});
	var redisConnectedProjects = [];
}
var socketController = function(socket) {
	socket.on('message', function(data) {
		if ("join" == data.command) {
			socket.join(data.projectKey);
			if (config.redis) {
				if (!redisConnectedProjects[data.projectKey]) {
					subscriber.subscribe(data.projectKey);
					redisConnectedProjects[data.projectKey] = true;
				}
			}
		} else {
			global.io.sockets["in"](data.projectKey).emit(data.item);
		}
	});
}
module.exports = socketController;