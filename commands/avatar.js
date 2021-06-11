const { imgDominantColor } = require('../utils');

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();

	return userMention ? userMention
		: userID ? await message.client.users.fetch(userID, true, true).catch(() => {})
			: message.author;
};

module.exports = {
	name: 'avatar',
	alias: ['av'],
	permissions: { bot: ['ATTACH_FILES'] },
	func: async function (message) {
		const user = await getUser(message);

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });

		const avatarFileName = avatarURL.split('/').pop().split('?')[0];
		const avatarDominantColor = await imgDominantColor(avatarURL);

		let messageAttachment = {
			files: [avatarURL],
			embed: {
				color: avatarDominantColor.value,
				author: {
					name: user.tag,
					icon_url: `attachment://${avatarFileName}`,
				},
				image: {
					url: `attachment://${avatarFileName}`,
				}
			}
		};

		try {
			await message.channel.send(messageAttachment);
		} catch (DiscordAPIError) {
			// If file size is too large, send avatar url.
			if (DiscordAPIError.code == 40005) {
				delete messageAttachment.files;
				messageAttachment.embed.author.icon_url = user.displayAvatarURL({ dynamic: true });
				messageAttachment.embed.image.url = avatarURL;

				message.channel.send(messageAttachment);
			}
		}
	}
};