const { queue } = require('./play');

module.exports = {
	name: 'skip',
	alias: ['s'],
	guildOnly: true,
	func: function (message) {
		const botVoiceChannel = message.guild.me.voice.channel;

		if (!botVoiceChannel) {
			message.channel.send('I am not playing any music. Type `.s play <song>` to play one.');
			return;
		}

		if (!botVoiceChannel.members.has(message.author.id)) {
			message.reply('Please join a voice channel where bot is playing first!');
			return;
		}

		const serverQueue = queue.get(message.guild.id);
		if (!serverQueue) {
			return;
		}

		serverQueue.dispatcher.end();
	}
};