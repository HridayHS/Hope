const { imgDominantColor } = require('../../utils');

module.exports = {
	name: 'serverbanner',
	alias: ['sb'],
	guildOnly: true,
	func: async function (message) {
		const server = message.guild;

		if (!server.available) {
			message.channel.send(`Server not accessible at the moment.`);
			return;
		}

		if (!server.banner) {
			message.channel.send(`Server banner not found.`);
			return;
		}

		const bannerDominantColor = await imgDominantColor(server.bannerURL({ format: 'png' }));

		message.channel.send({
			embed: {
				color: bannerDominantColor.value,
				author: {
					name: server.name,
					icon_url: server.bannerURL({ dynamic: true }),
				},
				image: {
					url: server.bannerURL({ format: 'png', dynamic: true, size: 4096 })
				}
			}
		});
	}
};