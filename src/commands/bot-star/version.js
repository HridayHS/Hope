const { botVersion } = require('../../../utils');

module.exports = {
	name: 'version',
	alias: ['v'],
	func: async function (message) {
		message.channel.send('Version ' + await botVersion());
	}
};