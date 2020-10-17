const botPermissions = ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK'];

module.exports = {
	name: 'botinvite',
	alias: ['botlink', 'botinvitelink', 'starinvite', 'starlink', 'starinvitelink'],
	func: async function (message) {
		message.channel.send(await message.client.generateInvite(botPermissions));
	}
};