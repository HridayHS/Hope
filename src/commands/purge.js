module.exports = {
	name: 'purge',
	permissions: ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
	func: async function (message) {
		const getPurgeAmount = message.content.toLowerCase().split(' ')[2];

		/* .s purge all */
		if (getPurgeAmount === 'all') {
			const oldChannelPossition = message.channel.position;
			const oldChannelWebhooks = await message.channel.fetchWebhooks();
			await message.channel.delete();

			const clonedChannel = await message.channel.clone({});
			clonedChannel.setPosition(oldChannelPossition);
			if (oldChannelWebhooks) {
				oldChannelWebhooks.forEach(fetchedWebhook => {
					clonedChannel.createWebhook(fetchedWebhook.name, { avatar: fetchedWebhook.avatarURL({ format: 'png', dynamic: true, size: 4096 }) });
				});
			}
			return;
		}

		await message.delete();

		let purgeAmount = parseInt(getPurgeAmount);
		if (purgeAmount < 1) {
			message.reply('Please enter a valid number! [1-100]');
			return;
		}

		purgeAmount = (purgeAmount >= 100) ? 100 : purgeAmount;

		message.channel.messages.fetch({ limit: 1 })
			.then(fetchedMessage => {
				if (Date.now() - fetchedMessage.first().createdAt.getTime() > 1209600000) {
					message.channel.send('Unable to purge messages older than 14 days.');
					return;
				}

				message.channel.bulkDelete(purgeAmount || 1, true)
					.catch(() => {
						message.channel.send('Failed to purge recent messages!');
					});
			})
			.catch(() => {
				message.channel.send('Failed to purge recent messages!');
			});
	}
};