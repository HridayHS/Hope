const { MessageEmbed } = require('discord.js');

const customDateFormat = date => {
	const Time12To24 = () => {
		const Hours = date.getHours();
		const Minutes = date.getMinutes();

		const HoursIn12 = (Hours === 0) ? 12
			: (Hours > 12) ? (Hours - 12)
				: Hours;

		const HourText = HoursIn12;
		const MinuteText = (Minutes <= 9) ? '0' + Minutes : Minutes;

		return HourText + ':' + MinuteText;
	};

	const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${Days[date.getDay()]}, ${date.getDate()} ${Months[date.getMonth()]}, ${date.getFullYear()} ${Time12To24()} ${date.getHours() > 12 ? 'PM' : 'AM'}`;
};

module.exports = {
	name: 'whois',
	alias: ['userinfo'],
	func: async function (message) {
		const getUser = async () => {
			const userID = message.content.split(' ')[2];

			if (message.mentions.users.first()) {
				return message.mentions.users.first();
			} else if (userID) {
				return await message.client.users.fetch(userID).catch(() => { });
			} else {
				return message.author;
			}
		};

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
			EmbedMessage.spliceFields(0, 0, { name: 'Joined', value: customDateFormat(message.guild.member(user).joinedAt), inline: true })
		}

		message.channel.send(EmbedMessage);
	}
};