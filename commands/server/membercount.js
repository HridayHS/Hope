module.exports = {
	name: 'membercount',
	guildOnly: true,
	func: function (message) {
		message.channel.send({
			embed: {
				author: {
					name: 'Member Count',
					icon_url: message.guild.iconURL()
				},
				color: 'GREEN',
				fields: [
					{ name: 'Members', value: message.guild.memberCount },
					{ name: 'Humans', value: message.guild.members.cache.filter(member => !member.user.bot).size },
					{ name: 'Bots', value: message.guild.members.cache.filter(member => member.user.bot).size }
				]
			}
		});
	}
};