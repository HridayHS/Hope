const unpinallPermissions = ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'];

module.exports = {
	name: 'unpinall',
	permissions: {
		bot: [...unpinallPermissions],
		member: [...unpinallPermissions]
	},
	func: async function (message) {
		const pinnedMessages = await message.channel.messages.fetchPinned();
		if (!pinnedMessages || pinnedMessages.size === 0) {
			message.channel.send('Unable to find pinned messages!');
			return;
		}

		pinnedMessages.forEach(async (pinnedMessage) => {
			await pinnedMessage.unpin()
				.catch(() => message.channel.send(`Failed to unpin ${pinnedMessage.url}`));
		});

		message.channel.send('Unpinned all the pinned messages!');
	}
};