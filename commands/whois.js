const { imgDominantColor, customDateFormat } = require('../utils');

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();

	return userMention ? userMention
		: userID ? await message.client.users.fetch(userID, true, true).catch(() => {})
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

		const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 });
		const avatarDominantColor = await imgDominantColor(avatarURL);

		const EmbedMessage = {
			author: {
				name: user.tag,
				icon_url: user.displayAvatarURL({ dynamic: true })
			},
			thumbnail: {
				url: avatarURL
			},
			color: avatarDominantColor.value,
			fields: [
				{ name: 'Created On', value: customDateFormat(user.createdAt), inline: true }
			],
			footer: {
				text: 'User ID: ' + user.id
			}
		};

		if (message.channel.type !== 'dm' && message.guild.member(user)) {
			EmbedMessage.fields.unshift({ name: 'Joined', value: customDateFormat(message.guild.member(user).joinedAt, true), inline: true });
		}

		message.channel.send({ embed: EmbedMessage });
	}
};