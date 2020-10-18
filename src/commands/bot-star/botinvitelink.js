const { botPermissions } = require('../../../utils');

module.exports = {
	name: 'botinvite',
	alias: ['botlink', 'botinvitelink', 'starinvite', 'starlink', 'starinvitelink'],
	func: async function (message) {
		message.channel.send(await message.client.generateInvite(botPermissions));
	}
};