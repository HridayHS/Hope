module.exports = {
	name: 'fetchemojis',
	func: async function (message) {
		const guildID = message.content.split(' ')[2];

		// Check if id is made of numbers
		if (isNaN(guildID)) {
			message.channel.send('Invalid server id');
			return;
		}

		const guild = await message.client.guilds.fetch(guildID);

		// If guild is not available return with a message.
		if (!guild || !guild.available) {
			message.channel.send('Unable to retrieve guild.');
			return;
		}

		// If Guild does not have any custom emojis return with a reply.
		if (guild.emojis.cache.size === 0) {
			message.channel.send('Guild does not have any custom emojis.');
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