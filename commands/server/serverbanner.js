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
			embeds: [{
				color: bannerDominantColor.value,
				author: {
					name: server.name,
					iconURL: server.bannerURL(),
				},
				image: {
					url: server.bannerURL({ format: 'png', size: 4096 })
				}
			}]
		});
	}
};