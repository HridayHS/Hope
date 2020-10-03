module.exports = {
	name: 'unpinall',
	func: function (message) {
		message.channel.messages.fetchPinned()
			.then(pinnedMessages => {
				if (pinnedMessages.size === 0) {
					message.channel.send('No pinned messages found!');
					return;
				}

				pinnedMessages.forEach(async (pinnedMessage) => {
					await pinnedMessage.unpin()
						.catch(() => message.channel.send(`Failed to unpin ${pinnedMessage.url}`));
				});

				message.channel.send('Unpinned all the pinned messages!');
			})
			.catch(() => {
				message.channel.send('Unpinning failed!')
			});
	}
};