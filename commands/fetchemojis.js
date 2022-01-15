module.exports = {
	name: 'fetchemojis',
	alias: ['av'],
	// permissions: {  },
	func: async function (message) {
		const guildID = message.content.split(' ')[2];

		// Check if id is made of numbers
		if (isNaN(guildID)) {
			message.channel.send('Invalid server id');
			return;
		}

		const guild = await message.client.guilds.fetch({ guildID, cache: true, force: true });

		// If guild is not available return with a message.
		if (!guild || !guild.available) {
			message.channel.send('Unable to retrieve guild.');
			return;
		}

		guild.emojis.cache.each(emoji => {
			if (!emoji.available) {
				return;
			}

			const emojiLink = emoji.url;
			message.channel.send(emojiLink);
		});
	}
};