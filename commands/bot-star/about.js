const { botPermissions, customDateFormat } = require('../../utils');

module.exports = {
	name: 'about',
	alias: ['abt', 'bot', 'abtbot', 'aboutbout', 'star', 'abtstar', 'aboutstar'],
	func: async function (message) {
		const bot = await message.client.fetchApplication();

		const botCreatedAt = customDateFormat(bot.createdAt);
		const botDeveloper = bot.owner.owner.user.tag;
		const botGuildsSize = message.client.guilds.cache.size;
		const botInviteLink = await message.client.generateInvite({ permissions: botPermissions });
		const botTeamMembersList = bot.owner.members.map(member => member.user.tag).sort().join(', ');

		message.channel.send({
			embed: {
				author: {
					name: 'About me',
					icon_url: message.client.user.displayAvatarURL()
				},
				color: 'GREEN',
				fields: [
					{ name: 'Created on', value: botCreatedAt, inline: true },
					{ name: 'Developer', value: botDeveloper, inline: true },
					{ name: 'Used in', value: `${botGuildsSize} Servers`, inline: true },
					{ name: 'Team members', value: botTeamMembersList, inline: false },
					{ name: 'Discord', value: '[Click here](https://discord.gg/cnkAxAT)', inline: true },
					{ name: 'Invite link', value: `[Click here](${botInviteLink})`, inline: true },
					{ name: 'Source code', value: '[GitHub](https://github.com/HridayHS/Star)', inline: true }
				],
				footer: {
					text: 'Made by Team Star'
				}
			}
		});
	}
};