module.exports = {
	name: 'avatar',
	func: async function (message, discord = {}) {
		const userID = message.content.split(' ')[2];

		const avatarAuthor = message.mentions.users.first()
			|| userID ? await discord.client.users.fetch(userID).catch(() => { }) : message.author;

		if (avatarAuthor) {
			message.channel.send(avatarAuthor.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }));
		} else {
			message.channel.send(`Unable to find user.`);
		}
	}
};