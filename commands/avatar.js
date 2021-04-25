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

		const imageBuffer = await DataResolver.resolveFileAsBuffer(user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }));
		const avatarAttachment = new MessageAttachment(imageBuffer, 'avatar.png');

		message.channel.send({
			files: [avatarAttachment],
			embed: {
				color: await imageAverageColor(avatarAttachment.attachment),
				author: {
					name: user.tag,
					icon_url: user.displayAvatarURL({ dynamic: true }),
				},
				image: {
					url: 'attachment://avatar.png'
				}
			}
		});
	}
};