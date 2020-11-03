const { imageAverageColor } = require('../utils');

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();

	return userMention ? userMention
		: userID ? await message.client.users.fetch(userID, true, true).catch(() => { })
			: message.author;
};

module.exports = {
	name: 'avatar',
	alias: ['av'],
	func: async function (message) {
		const user = await getUser(message);

		if (!user) {
			message.channel.send(`Unable to find user.`);
			return;
		}

		message.channel.send({
			embed: {
				color: await imageAverageColor(user.displayAvatarURL({ format: 'png' })),
				author: {
					name: user.tag,
					icon_url: user.displayAvatarURL({ dynamic: true }),
				},
				image: {
					url: user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
				}
			}
		});
	}
};