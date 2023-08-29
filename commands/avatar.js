const { imgDominantColor } = require('../utils');

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();

	return userMention ? userMention
		: userID ? await message.client.users.fetch(userID, { cache: true, force: true }).catch(() => {})
			: message.author;
};

module.exports = {
	name: 'avatar',
	alias: ['av'],
	permissions: { bot: ['AttachFiles'] },
	func: async function (message) {
		const user = await getUser(message);

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		const avatarURL = user.displayAvatarURL({ extension: 'png', size: 4096 });

		const avatarFileName = avatarURL.split('/').pop().split('?')[0];
		const avatarDominantColor = await imgDominantColor(avatarURL);

		let messageAttachment = {
			files: [avatarURL],
			embeds: [{
				color: avatarDominantColor,
				author: {
					name: user.tag,
					iconURL: `attachment://${avatarFileName}`,
				},
				image: {
					url: `attachment://${avatarFileName}`,
				}
			}]
		};

		try {
			await message.channel.send(messageAttachment);
		} catch (DiscordAPIError) {
			// If file size is too large, send avatar url.
			if (DiscordAPIError.code == 40005) {
				delete messageAttachment.files;
				messageAttachment.embeds[0].author.iconURL = user.displayAvatarURL();
				messageAttachment.embeds[0].image.url = avatarURL;

				message.channel.send(messageAttachment);
			}
		}
	}
};