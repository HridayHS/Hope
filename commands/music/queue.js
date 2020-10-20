const { queue } = require('./utils');

module.exports = {
	name: 'queue',
	alias: ['q'],
	guildOnly: true,
	func: async function (message) {
		const serverQueue = queue.get(message.guild.id);

		const EmbedMessage = {
			color: '#FF0000',
			title: 'Music Queue',
			description: serverQueue ? serverQueue.queuedList : 'Song queue is empty.\nType `.s play <song>` to add one.',
		};

		message.channel.send({ embed: EmbedMessage });
	}
};