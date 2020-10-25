const { DataResolver } = require('discord.js');
const { getAverageColor } = require('fast-average-color-node');

module.exports = {
	name: 'avatar',
	alias: ['av'],
	func: async function (message) {
		async function getUser() {
			const userID = message.content.split(' ')[2];
			const userMention = message.mentions.users.first();

			return userMention ? userMention
				: userID ? await message.client.users.fetch(userID).catch(() => { })
					: message.author;
		};

		const user = await getUser();

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		const userAvatar = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });
		const avatarBuffer = await DataResolver.resolveFileAsBuffer(userAvatar);
		const avatarAverageColor = (await getAverageColor(avatarBuffer)).hex;

		message.channel.send({
			embed: {
				color: avatarAverageColor,
				author: {
					name: user.tag,
					icon_url: user.displayAvatarURL({ dynamic: true }),
				},
				image: {
					url: userAvatar
				}
			}
		});
	}
};