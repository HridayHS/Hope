module.exports = {
	name: 'ping',
	func: function (message) {
		message.channel.send('Pong!');
	}
}