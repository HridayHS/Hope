module.exports = {
	name: 'membercount',
	guildOnly: true,
	func: async function (message) {
		const serverMembers = await message.guild.members.fetch({ force: true });

		message.channel.send({
			embed: {
				author: {
					name: 'Member Count',
					icon_url: message.guild.iconURL()
				},
				color: 'GREEN',
				fields: [
					{ name: 'Members', value: message.guild.memberCount },
					{ name: 'Humans', value: serverMembers.filter(member => !member.user.bot).size },
					{ name: 'Bots', value: serverMembers.filter(member => member.user.bot).size }
				]
			}
		});
	}
};