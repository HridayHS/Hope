const { imageAverageColor } = require('../../utils');

module.exports = {
	name: 'servericon',
	alias: ['si'],
	func: async function (message) {
		const server = message.guild;

		if (!server.available) {
			message.channel.send(`Server not accessible at the moment.`);
			return;
		}

		if (!server.icon) {
			message.channel.send(`Server icon not found.`);
			return;
		}

		message.channel.send({
			embed: {
				color: await imageAverageColor(server.iconURL({ format: 'png' })),
				author: {
					name: server.name,
					icon_url: server.iconURL({ dynamic: true }),
				},
				image: {
					url: server.iconURL({ format: 'png', dynamic: true, size: 4096 })
				}
			}
		});
	}
};