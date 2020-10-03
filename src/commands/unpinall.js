module.exports = {
	name: 'unpinall',
	func: async function (message) {
		await message.channel.messages.fetchPinned()
			.then(pinnedMessages => {
				for (const [key, pinnedMessage] of pinnedMessages) {
					pinnedMessage.unpin().catch(() => message.channel.send(`Failed to unpin ${pinnedMessage.url}`));
				}
			})
			.catch(() => {
				message.channel.send('Unpinning failed!')
			});

		message.channel.send('Unpinned all the pinned messages!');
	}
};