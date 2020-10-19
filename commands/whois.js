const { MessageEmbed } = require('discord.js');
const { customDateFormat } = require('../utils');

module.exports = {
	name: 'whois',
	alias: ['userinfo'],
	func: async function (message) {
		async function getUser() {
			const userID = message.content.split(' ')[2];
			const userMention = message.mentions.users.first();

			return userMention ? userMention
				: userID ? await message.client.users.fetch(userID).catch(() => {})
					: message.author;
		};;

		const user = await getUser();

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		const EmbedMessage = new MessageEmbed()
			.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
			.setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }))
			.setColor('GREEN')
			.addFields(
				{ name: 'Registered', value: customDateFormat(user.createdAt), inline: true },
			)
			.setFooter('ID: ' + user.id);

		if (message.channel.type !== 'dm' && message.guild.member(user)) {
			EmbedMessage.spliceFields(0, 0, { name: 'Joined', value: customDateFormat(message.guild.member(user).joinedAt, true), inline: true })
		}

		message.channel.send(EmbedMessage);
	}
};