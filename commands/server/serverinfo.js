const { serverLocaleHR } = require('../../utils');

module.exports = {
	name: 'serverinfo',
	alias: ['si', 'svinfo'],
	guildOnly: true,
	func: async function (message) {
		const serverCreated = message.guild.createdAt;
		const serverMembers = await message.guild.members.fetch({ force: true });
		const serverRoles = await message.guild.roles.fetch(null, { force: true });
		const serverOwner = await message.guild.fetchOwner();

		message.channel.send({
			embeds: [{
				author: {
					name: message.guild.name,
					iconURL: message.guild.iconURL({ dynamic: true })
				},
				thumbnail: { url: message.guild.iconURL({ format: 'png', dynamic: true, size: 4096 }) },
				color: 'GREEN',
				fields: [
					{ name: 'Owner', value: serverOwner.user.tag, inline: true },
					{ name: 'Locale', value: serverLocaleHR(message.guild.preferredLocale), inline: true },
					{ name: 'Admins', value: serverMembers.filter(member => !member.user.bot && member.permissions.has('ADMINISTRATOR')).size.toString(), inline: true },
					{ name: 'Roles', value: serverRoles.size.toString(), inline: true },
					{ name: 'Roles List', value: serverRoles.map(role => role.name).join(', '), inline: false }
				],
				footer: {
					text: 'ID: ' + message.guild.id + ' | ' + 'Server Created • ' + `${serverCreated.getDate()}/${serverCreated.getMonth()}/${serverCreated.getFullYear()}`
				}
			}]
		});
	}
};