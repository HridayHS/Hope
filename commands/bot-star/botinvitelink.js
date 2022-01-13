const { botPermissions } = require('../../utils');

module.exports = {
	name: 'botinvite',
	alias: ['botlink', 'botinvitelink', 'starinvite', 'starlink', 'starinvitelink'],
	func: async function (message) {
		const inviteLink = await message.client.generateInvite({ scopes: ['bot'], permissions: botPermissions });
		message.channel.send(inviteLink);
	}
};