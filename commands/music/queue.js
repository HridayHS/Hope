const { queue } = require('./play');

const reactions = ['⬆', '⬇'];

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

		const queueMessage = await message.channel.send({
			embed: {
				color: '#FF0000',
				title: 'Music Queue',
				description: serverQueue.queueList[0]
			}
		});

		// Return if there are only 1 queue page.
		if (serverQueue.queueList.length === 1) {
			return;
		}

		serverQueue.currentPage = 0;
		reactions.forEach(reaction => queueMessage.react(reaction));

		const collectorFilter = reaction => reactions.some(queueReaction => queueReaction === reaction.emoji.name);
		serverQueue.collector = queueMessage.createReactionCollector(collectorFilter);

		serverQueue.collector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) {
				return;
			}

			const isUserAllowedToPeformAction = serverQueue.voiceChannel.members.has(user.id);
			if (isUserAllowedToPeformAction) {
				switch (reaction.emoji.name) {
					case '⬆':
						queueMessage.edit({
							embed: {
								color: '#FF0000',
								title: 'Music Queue',
								description: serverQueue.queueList[getPreviousPage(serverQueue)]
							}
						});
						break;
					case '⬇':
						queueMessage.edit({
							embed: {
								color: '#FF0000',
								title: 'Music Queue',
								description: serverQueue.queueList[getNextPage(serverQueue)]
							}
						});
						break;
				}
			}

			reaction.users.remove(user.id);
		});

		serverQueue.collector.on('end', collected => {
			collected.forEach(reaction => reaction.remove());
			queueMessage.edit({
				embed: {
					color: '#FF0000',
					title: 'Music queue has ended!',
					description: 'Type `.s play <song>` to add more.'
				}
			});
		});
	}
};

function getPreviousPage(serverQueue) {
	if (serverQueue.currentPage === 0) {
		return 0;
	}
	return --serverQueue.currentPage;
}

function getNextPage(serverQueue) {
	if (serverQueue.currentPage === serverQueue.queueList.length - 1) {
		return serverQueue.currentPage;
	}
	return ++serverQueue.currentPage;
}