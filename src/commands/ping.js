module.exports = {
	name: 'ping',
	guildOnly: true,
	func: function (message) {
		message.channel.send('Pong!');
	}
}