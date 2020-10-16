module.exports = {
	name: 'avatar',
	func: async function (message) {
		const user = async () => {
			const userID = message.content.split(' ')[2];

			if (message.mentions.users.first()) {
				return message.mentions.users.first();
			} else if (userID) {
				return await message.client.users.fetch(userID).catch(() => { });
			} else {
				return message.author;
			}
		};

		const avatarAuthor = await user();

		if (avatarAuthor) {
			message.channel.send(avatarAuthor.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }));
		} else {
			message.channel.send(`Unable to find user.`);
		}
	}
};