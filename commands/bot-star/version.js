const { botVersion } = require('../../utils');

module.exports = {
	name: 'version',
	alias: ['v'],
	func: function (message) {
		message.channel.send('Version ' + botVersion);
	}
};