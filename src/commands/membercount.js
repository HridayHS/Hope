module.exports = {
	name: 'membercount',
	guildOnly: true,
	func: function (message, discord = {}) {
		message.channel.send(
			new discord.MessageEmbed()
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