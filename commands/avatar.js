const { DataResolver, MessageAttachment } = require('discord.js');
const { getAverageColor } = require('fast-average-color-node');

const { imageAverageColor } = require('../utils');

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

		const userDisplayAvatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });

		const imageBuffer = await DataResolver.resolveFileAsBuffer(userDisplayAvatarURL);
		const avatarType = userDisplayAvatarURL.split('.').pop().split('?')[0];
		const attachmentFileName = avatarType == 'gif' ? 'avatar.gif' : 'avatar.png';

		const avatarAttachment = new MessageAttachment(imageBuffer, attachmentFileName);

		let messageAttachment = {
			files: [avatarAttachment],
			embed: {
				color: await imageAverageColor(userDisplayAvatarURL),
				author: {
					name: user.tag,
					icon_url: `attachment://${attachmentFileName}`,
				},
				image: {
					url: `attachment://${attachmentFileName}`,
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
				messageAttachment.embed.image.url = userDisplayAvatarURL;

				message.channel.send(messageAttachment);
			}
		}
	}
};