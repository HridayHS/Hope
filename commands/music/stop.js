const { queue } = require('./play');

module.exports = {
	name: 'stop',
	alias: ['s', 'leave'],
	guildOnly: true,
	func: async function (message) {
		if (!message.member.roles.cache.find(role => role.name === 'DJ') && !message.member.hasPermission('MOVE_MEMBERS')) {
			message.channel.send('This command requires you to either have a role named DJ or the Move Members permission to use it.');
			return;
		}

		const voiceChannel = message.guild.me.voice.channel;
		if (!voiceChannel) {
			message.channel.send('I am not playing any music. Type `.s play <song>` to play one.');
			return;
		}

		if (!queue.get(message.guild.id)) {
			return;
		}

		await voiceChannel.leave();
		message.channel.send('Successfully disconnected!');
		queue.delete(message.guild.id);
	}
};