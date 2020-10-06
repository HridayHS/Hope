const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'membercount',
	func: function (message) {
		message.channel.send(
			new MessageEmbed()
				.setAuthor('Member Count', message.guild.iconURL())
				.setColor('GREEN')
				.addFields(
					{ name: 'Members', value: message.guild.memberCount },
					{ name: 'Humans', value: message.guild.members.cache.filter(member => !member.user.bot).size },
					{ name: 'Bots', value: message.guild.members.cache.filter(member => member.user.bot).size }
				)
		);
	}
};