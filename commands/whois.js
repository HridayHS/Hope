const { ChannelType } = require('discord.js');
const { imgDominantColor, customDateFormat } = require('../utils');

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();

	return userMention ? userMention
		: userID ? await message.client.users.fetch(userID, { cache: true, force: true }).catch(() => {})
			: message.author;
};

module.exports = {
	name: 'whois',
	alias: ['userinfo'],
	func: async function (message) {
		const user = await getUser(message);

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		const avatarURL = user.displayAvatarURL({ extension: 'png', size: 4096 });
		const avatarDominantColor = await imgDominantColor(avatarURL);

		const EmbedMessage = {
			author: {
				name: user.tag,
				iconURL: user.displayAvatarURL()
			},
			thumbnail: {
				url: avatarURL
			},
			color: avatarDominantColor,
			fields: [
				{ name: 'Created On', value: customDateFormat(user.createdAt, true), inline: true }
			],
			footer: {
				text: 'User ID: ' + user.id
			}
		};

		if (message.channel.type != ChannelType.DM && message.guild.members.cache.get(user.id)) {
			EmbedMessage.fields.unshift({ name: 'Joined', value: customDateFormat(message.guild.members.cache.get(user.id).joinedAt, true), inline: true });
		}

		message.channel.send({ embeds: [EmbedMessage] });
	}
};