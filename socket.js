var socketController = function(socket) {
	socket.on('message', function(data) {
		console.log("io connected message = "+JSON.stringify(data));
		if ("join" == data.command) {
			socket.join(data.projectKey);
		} else {
			global.io.sockets.in(data.projectKey).emit(data.item);
		}
	});
	socket.on('disconnect', function() {
		console.log("disconnect");
	});
}
module.exports = socketController;