const { queue } = require('./play');

module.exports = {
	name: 'stop',
	alias: ['s', 'leave'],
	guildOnly: true,
	func: function (message) {
		if (!message.member.roles.cache.find(role => role.name === 'DJ') && !message.member.hasPermission('MANAGE_CHANNELS')) {
			message.channel.send('This command requires you to either have a role named DJ or the Manage Channels permission to use it.')
			return;
		}

		const voiceChannel = message.guild.me.voice.channel;
		if (!voiceChannel) {
			message.channel.send('I am not connected to a voice channel!');
			return;
		}

		const serverQueue = queue.get(message.guild.id);
		if (serverQueue && serverQueue.dispatcher) {
			serverQueue.dispatcher.end();
		}
	}
};