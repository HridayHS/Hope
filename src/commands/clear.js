module.exports = {
	name: 'clear',
	func: async function (message) {
		const getClearAmount = message.content.toLowerCase().split(' ')[2];

		/* .s clear all */
		if (getClearAmount === 'all') {
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

		let clearAmount = parseInt(getClearAmount);
		if (clearAmount < 1) {
			message.reply('Please enter a valid number! [1-100]');
			return;
		}

		clearAmount = (clearAmount >= 100) ? 100 : clearAmount;

		message.channel.messages.fetch({ limit: 1 })
			.then(fetchedMessage => {
				if (Date.now() - fetchedMessage.first().createdAt.getTime() > 1209600000) {
					message.channel.send('Unable to clear messages older than 14 days.');
					return;
				}

				message.channel.bulkDelete(clearAmount || 1, true)
					.catch(() => {
						message.channel.send('Failed to clear recent messages!');
					});
			})
			.catch(() => {
				message.channel.send('Failed to clear recent messages!');
			});
	}
};