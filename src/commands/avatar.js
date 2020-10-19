module.exports = {
	name: 'avatar',
	func: async function (message) {
		const user = async () => {
			const userID = message.content.split(' ')[2];
			const userMention = message.mentions.users.first();

			return userMention ? userMention
				: userID ? await message.client.users.fetch(userID)
					: message.author;
		};

		const avatarAuthor = await user();

		if (avatarAuthor) {
			message.channel.send(avatarAuthor.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }));
		} else {
			message.channel.send(`Unable to find user.`);
		}
	}
};