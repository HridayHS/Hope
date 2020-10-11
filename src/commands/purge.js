module.exports = {
	name: 'purge',
	alias: ['clear', 'clean', 'delete'],
	guildOnly: true,
	permissions: ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
	func: async function (message) {
		const userInput = message.content.toLowerCase().split(' ')[2];

		/* .s clear all */
		if (userInput === 'all') {
			const oldChannelPossition = message.channel.position;
			const oldChannelWebhooks = await message.channel.fetchWebhooks();
			await message.channel.delete();

			const channelClone = await message.channel.clone();
			channelClone.setPosition(oldChannelPossition);
			oldChannelWebhooks.forEach(webhook => {
				channelClone.createWebhook(webhook.name, { avatar: webhook.avatarURL() });
			});
			channelClone.send(`<@${message.author.id}>, All messages purged!`);
			return;
		}

		// Return with a message if last is message is older than 14 days.
		const lastMessage = await message.channel.messages.fetch({ limit: 2 });
		if (Date.now() - lastMessage.last().createdAt.getTime() > 1209600000) {
			message.channel.send('Unable to purge messages older than 14 days.');
			return;
		}

		/* .s clear @member */
		const mentionedUser = message.mentions.users.first();
		if (mentionedUser) {
			const userMessages = (await message.channel.messages.fetch({ limit: 100 }))
				.filter(message => message.author.id === mentionedUser.id);

			if (userMessages.size === 0) {
				message.channel.send(`Unable to find ${mentionedUser.username}'s messages.`);
				return;
			}

			message.channel.bulkDelete(userMessages, true)
				.then(() => message.channel.send(`Purged ${mentionedUser.username}'s messages.`))
				.catch(() => message.channel.send(`Failed to purge ${mentionedUser.username}'s messages!`));
			return;
		}

		/* .s clear [1-100] */
		let purgeAmount = parseInt(userInput);
		if (isNaN(purgeAmount) && purgeAmount < 1) {
			message.reply('Please enter a valid number. [1-100]');
			return;
		}

		purgeAmount = (purgeAmount >= 100) ? 100 : purgeAmount + 1;

		message.channel.bulkDelete(purgeAmount || 2, true)
			.catch(() => message.channel.send('Failed to purge recent messages!'));
		return;
	}
};