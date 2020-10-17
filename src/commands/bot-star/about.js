const { MessageEmbed } = require('discord.js');

const customDateFormat = date => {
	const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${Days[date.getDay()]}, ${date.getDate()} ${Months[date.getMonth()]}, ${date.getFullYear()}`;
};

const botPermissions = ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK'];

module.exports = {
	name: 'about',
	alias: ['bot', 'aboutbout', 'star', 'aboutstar'],
	func: async function (message) {
		const bot = await message.client.fetchApplication();
		const botCreatedAt = customDateFormat(bot.createdAt);
		const botInviteLink = await message.client.generateInvite(botPermissions);
		const teamMembersList = bot.owner.members.map(member => member.user.tag).sort().join(', ');

		message.channel.send(
			new MessageEmbed()
				.setAuthor('About me', message.client.user.displayAvatarURL())
				.setColor('GREEN')
				.addFields(
					{ name: 'Created on', value: botCreatedAt, inline: true },
					{ name: 'Used in', value: `${message.client.guilds.cache.size} Servers`, inline: true },
					{ name: 'Developer', value: bot.owner.owner.user.tag, inline: true },
					{ name: 'Team members', value: teamMembersList, inline: false },
					{ name: 'Discord', value: '[Click here](https://discord.gg/cnkAxAT)', inline: true },
					{ name: 'Invite link', value: `[Click here](${botInviteLink})`, inline: true },
					{ name: 'Source code', value: '[GitHub](https://github.com/HridayHS/Star)', inline: true },
				)
				.setFooter('Made by Team Star')
		);
	}
};