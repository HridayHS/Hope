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

		const avatarBuffer = await DataResolver.resolveFileAsBuffer(user.displayAvatarURL({ format: 'png' }));
		const avatarAverageColor = await getAverageColor(avatarBuffer);

		message.channel.send({
			embed: {
				color: avatarAverageColor.hex,
				author: {
					name: user.tag,
					icon_url: user.displayAvatarURL({ dynamic: true }),
				},
				image: {
					url: user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
				}
			}
		});
	}
};