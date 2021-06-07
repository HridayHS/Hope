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
		const avatarFileName = userDisplayAvatarURL.split('/').pop().split('?')[0];

		let messageAttachment = {
			files: [userDisplayAvatarURL],
			embed: {
				color: await imageAverageColor(userDisplayAvatarURL),
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
				messageAttachment.embed.image.url = userDisplayAvatarURL;

				message.channel.send(messageAttachment);
			}
		}
	}
};