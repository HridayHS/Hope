module.exports = {
	name: 'avatar',
	alias: ['av'],
	func: async function (message) {
		async function getUser() {
			const userID = message.content.split(' ')[2];
			const userMention = message.mentions.users.first();

			return userMention ? userMention
				: userID ? await message.client.users.fetch(userID).catch(() => {})
					: message.author;
		};

		const user = await getUser();
		if (user) {
			message.channel.send(user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 }));
		} else {
			message.channel.send(`Unable to find user.`);
		}
	}
};