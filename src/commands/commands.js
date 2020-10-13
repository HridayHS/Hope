const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds'],
	func: function (message) {
		const Commands = {
			'avatar [@member]': 'Display avatar',
			'emoji <custom emoji>': 'Get emoji link',
			'membercount': 'Get members count',
			'pin <message>': 'Pins the message',
			'ping': 'Says pong',
			'purge [1-100 | @member | all]': 'Purge recent messages',
			'serverinfo': 'Display server info',
			'unpinall': 'Unpins all the pinned messages',
			'whois [@member]': 'Get member info'
		};

		if (message.channel.type === 'dm') {
			delete Commands['avatar [@member]'];
			delete Commands['membercount'];
			delete Commands['purge [1-100 | @member | all]'];
			delete Commands['whois [@member]'];
		}

		let CommandsDescription = '';
		for (const CommandName in Commands) {
			CommandsDescription += '`.s ' + CommandName + '`' + '\n' + Commands[CommandName] + '\n\n';
		}

		message.channel.send(
			new MessageEmbed()
				.setAuthor('Bot Commands', 'https://cdn.discordapp.com/app-icons/545420239706521601/9fb441dfa2135181808a394f8189c2cf.webp')
				.setColor('RED')
				.setDescription(CommandsDescription)
		);
	}
};