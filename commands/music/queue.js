const { queue } = require('./play');

function getQueueList(songs) {
	const queueList = new Array();
	const queuePages = Math.ceil(songs.length / 10);

	for (let i = 0; i < queuePages; i++) {
		queueList.push('');

		for (let z = (i * 10); z < ((i + 1) * 10); z++) {
			const song = songs[z];
			if (!song) break;
			queueList[i] += `${z + 1}. ` + `[${song.title}](${song.url})` + '\n';
		}
	}

	return queueList;
}

function getMessageEmbed(queueList, page) {
	const embed = {
		color: '#FF0000',
		title: 'Music Queue',
		description: queueList[page]
	};

	if (queueList.length > 1) {
		embed.footer = {
			text: `Page ${page + 1}/${queueList.length}`
		};
	}

	return embed;
}

const reactions = ['⬅️', '➡️'];

module.exports = {
	name: 'queue',
	alias: ['q'],
	guildOnly: true,
	func: async function (message) {
		const serverQueue = queue.get(message.guild.id);

		// If server queue doesn't exist, return with message.
		if (!serverQueue) {
			message.channel.send({
				embed: {
					color: '#FF0000',
					title: 'Music Queue',
					description: 'Queue is empty.\nType `.s play <song>` to add one.'
				}
			});
			return;
		}

		const queueList = getQueueList(serverQueue.songs);
		const queueMessage = await message.channel.send({ embed: getMessageEmbed(queueList, 0) });

		// Return if there is only 1 queue page.
		if (queueList.length === 1) {
			return;
		}

		// Set queue list current page to 0;
		let currentPage = 0;

		// Add reactions to queue message
		reactions.forEach(reaction => queueMessage.react(reaction));

		const collectorFilter = reaction => reactions.some(queueReaction => queueReaction === reaction.emoji.name);
		const reactionCollector = queueMessage.createReactionCollector(collectorFilter);

		reactionCollector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) return;

			if (serverQueue.voiceChannel.members.has(user.id)) {
				const queueList = getQueueList(serverQueue.songs);
				let page;

				switch (reaction.emoji.name) {
					case '⬅️': // Get previous page
						page = currentPage === 0 ? 0 : --currentPage;
						break;
					case '➡️': // Get Next page
						page = (currentPage === queueList.length - 1) ? currentPage : ++currentPage;
						break;
				}

				// Switch page
				queueMessage.edit({ embed: getMessageEmbed(queueList, page) });
			}

			reaction.users.remove(user.id);
		});

		reactionCollector.on('end', collected => {
			collected.forEach(reaction => reaction.remove());
		});

		// Store reaction collector to server queue.
		serverQueue.queueMessage.reactionCollectors.push(reactionCollector);
	}
};