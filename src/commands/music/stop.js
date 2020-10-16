const ytdl = require('ytdl-core');

module.exports = {
	name: 'stop',
	alias: ['s'],
	guildOnly: true,
	func: function (message, discord = {}) {
		if (!message.member.roles.cache.find(role => role.name === 'DJ') && !message.member.hasPermission('MANAGE_CHANNELS')) {
			message.channel.send('This command requires you to either have a role named DJ or the Manage Channels permission to use it.')
			return;
		}

		const voiceChannel = message.guild.me.voice.channel;
		if (!voiceChannel) {
			message.channel.send('I am not connected to a voice channel!');
			return;
		}
		voiceChannel.leave();
		message.channel.send('Successfully disconnected!');
	}
};