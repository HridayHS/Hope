const { queue } = require('./play');

module.exports = {
	name: 'skip',
	alias: ['s'],
	guildOnly: true,
	func: function (message) {
		const serverQueue = queue.get(message.guild.id);
		const voiceChannel = message.guild.me.voice.channel;

		if (!voiceChannel || !serverQueue) {
			message.channel.send('I am not playing. Type `.s play <song>` to play.');
			return;
		}

		if (!voiceChannel.members.has(message.author.id)) {
			message.reply('Please join a voice channel where bot is playing first!');
			return;
		}

		serverQueue.dispatcher.end();
	}
};