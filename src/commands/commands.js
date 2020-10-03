const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'commands',
	func: function (message) {
		const Commands = {
			'avatar [@user]': 'Display avatar',
			'purge [1-100 | all]': 'Purge recent messages',
			'pin <message>': 'Pins the message',
			'ping': 'Says pong',
			'unpinall': 'Unpins all the pinned messages'
		};

		let CommandsDescription = '';
		for (const CommandName in Commands) {
			CommandsDescription += '`.s ' + CommandName + '`' + '\n' + Commands[CommandName] + '\n\n';
		}

		message.channel.send(
			new MessageEmbed()
				.setAuthor('Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('RED')
				.setDescription(CommandsDescription)
		);
	}
};