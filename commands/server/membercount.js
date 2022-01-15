module.exports = {
	name: 'membercount',
	guildOnly: true,
	func: async function (message) {
		const serverMembers = await message.guild.members.fetch({ force: true });

		const MembersCount = {
			Total: message.guild.memberCount,
			Humans: serverMembers.filter(member => !member.user.bot).size,
			Bots: serverMembers.filter(member => member.user.bot).size
		};

		message.channel.send({
			embeds: [{
				author: {
					name: 'Member Count',
					iconURL: message.guild.iconURL()
				},
				color: 'GREEN',
				fields: [
					{ name: 'Total Members', value: MembersCount.Total.toString() },
					{ name: 'Humans', value: MembersCount.Humans.toString() },
					{ name: 'Bots', value: MembersCount.Bots.toString() }
				]
			}]
		});
	}
};