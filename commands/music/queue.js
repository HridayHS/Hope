const { queue } = require('./play');

function getQueueList(songsArr) {
	const queueList = new Array();
	const queuePages = Math.ceil(songsArr.length / 10);

	for (let i = 0; i < queuePages; i++) {
		queueList.push('');

		for (let z = (i * 10); z < ((i + 1) * 10); z++) {
			const song = songsArr[z];
			if (!song) break;
			queueList[i] += `${z + 1}. ` + `[${song.title}](${song.url})` + '\n';
		}
	}

	return queueList;
}

function switchPage(emoji, serverQueue, queueList) {
	const queueMessage = serverQueue.queue;

	switch (emoji) {
		case '⬅️':
			return (queueMessage.currentPage === 0) ? 0
				: --queueMessage.currentPage;
		case '➡️':
			return (queueMessage.currentPage === queueList.length - 1) ? queueMessage.currentPage
				: ++queueMessage.currentPage;
	}
}

function getMessageEmbed(queueList, page) {
	const embedMessage = {
		embed: {
			color: '#FF0000',
			title: 'Music Queue',
			description: queueList[page]
		}
	};

	if (queueList.length > 1) {
		embedMessage.embed.footer = {
			text: `Page ${page + 1}/${queueList.length}`
		};
	}

	return embedMessage;
}

const reactions = ['⬅️', '➡️'];

module.exports = {
	name: 'queue',
	alias: ['q'],
	guildOnly: true,
	func: async function (message) {
		const serverQueue = queue.get(message.guild.id);

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

		let defaultPage = 0;

		if (serverQueue.queue) {
			serverQueue.queue.reactionCollector.stop();
			serverQueue.queue.message.delete();
			defaultPage = serverQueue.queue.currentPage;
		}

		const queueList = getQueueList(serverQueue.songs);

		const queueMessage = await message.channel.send(getMessageEmbed(queueList, defaultPage));

		// Return if there is only 1 queue page.
		if (queueList.length === 1) {
			return;
		}

		serverQueue.queue = {
			message: queueMessage,
			reactionCollector: undefined,
			currentPage: defaultPage
		};

		// Add reactions to queue message
		reactions.forEach(reaction => queueMessage.react(reaction));

		const collectorFilter = reaction => reactions.some(queueReaction => queueReaction === reaction.emoji.name);
		serverQueue.queue.reactionCollector = queueMessage.createReactionCollector(collectorFilter);

		serverQueue.queue.reactionCollector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) return;

			if (serverQueue.voiceChannel.members.has(user.id)) {
				const emoji = reaction.emoji.name;
				switch (emoji) {
					case '⬅️':
						const previousPage = switchPage(emoji, serverQueue);
						queueMessage.edit(getMessageEmbed(queueList, previousPage));
						break;
					case '➡️':
						const nextPage = switchPage(emoji, serverQueue, queueList);
						queueMessage.edit(getMessageEmbed(queueList, nextPage));
						break;
				}
			}

			reaction.users.remove(user.id);
		});

		serverQueue.queue.reactionCollector.on('end', (collected, reason) => {
			if (reason === 'QueueEnded') {
				collected.forEach(reaction => reaction.remove());
			}
		});
	}
};