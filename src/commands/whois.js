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
	func: function (message) {
		const user = message.mentions.users.first() || message.author;
		message.channel.send(
			new MessageEmbed()
				.setAuthor(user.tag, user.avatarURL({ dynamic: true }))
				.setThumbnail(user.avatarURL({ format: 'png', dynamic: true, size: 4096 }))
				.setColor('GREEN')
				.addFields(
					{ name: 'Joined', value: customDateFormat(message.guild.member(user).joinedAt), inline: true },
					{ name: 'Registered', value: customDateFormat(user.createdAt), inline: true },
				)
				.setFooter('ID: ' + user.id)
		);
	}
};