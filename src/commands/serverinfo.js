const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'serverinfo',
	guildOnly: true,
	func: async function (message) {
		const serverCreated = message.guild.createdAt;
		const serverRegion = region => {
			switch (region) {
				case 'hongkong':
					return 'Hong Kong'
				case 'southafrica':
					return 'South Africa'
				case 'us-central':
					return 'US Central'
				case 'us-east':
					return 'US East'
				case 'us-south':
					return 'US South'
				case 'us-west':
					return 'US West'
				default:
					return region.charAt(0).toUpperCase() + region.slice(1);
			}
		};
		const serverRoles = async () => {
			let rolesList = '';
			(await message.guild.roles.fetch()).cache.forEach(role => rolesList += role.name + ', ');
			return rolesList;
		};

		message.channel.send(
			new MessageEmbed()
				.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
				.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 4096 }))
				.setColor('GREEN')
				.addFields(
					{ name: 'Owner', value: message.guild.owner, inline: true },
					{ name: 'Region', value: serverRegion(message.guild.region), inline: true },
					{ name: 'Admins', value: message.guild.members.cache.filter(member => !member.user.bot && member.hasPermission('ADMINISTRATOR')).size, inline: true },
					{ name: 'Roles', value: (await message.guild.roles.fetch()).cache.size, inline: true },
					{ name: 'Roles List', value: await serverRoles(), inline: false },
				)
				.setFooter('ID: ' + message.guild.id + ' | ' + 'Server Created • ' + `${serverCreated.getDate()}/${serverCreated.getMonth()}/${serverCreated.getFullYear()}`)
		);
	}
};