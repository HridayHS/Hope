const { queue } = require('./play');

module.exports = {
	name: 'stop',
	alias: ['leave'],
	guildOnly: true,
	func: async function (message) {
		if (!message.member.roles.cache.find(role => role.name === 'DJ') && !message.member.hasPermission('MOVE_MEMBERS')) {
			message.channel.send('This command requires you to either have a role named DJ or the Move Members permission to use it.');
			return;
		}

		const voiceChannel = message.guild.me.voice.channel;

		if (!voiceChannel || !queue.get(message.guild.id)) {
			message.channel.send('I am not playing. Type `.s play <song>` to play.');
			return;
		}

		if (!voiceChannel.members.has(message.author.id)) {
			message.reply('Please join a voice channel where bot is playing first!');
			return;
		}

		await voiceChannel.leave();
		message.channel.send('Successfully disconnected!');
		queue.delete(message.guild.id);
	}
};