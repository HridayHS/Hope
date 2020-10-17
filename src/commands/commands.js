const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds', 'command'],
	func: function (message) {
		const Commands = {
			'about': 'Get info about bot',
			'avatar [@member]': 'Display avatar',
			'botdiscord': 'Get bot discord link',
			'botinvite': 'Get bot invite link',
			'emoji <custom emoji>': 'Get emoji link',
			'membercount': 'Get members count',
			'pin <message>': 'Pins the message',
			'ping': 'Says pong',
			'play <song name | youtube video link>': 'Play a song',
			'purge [1-100 | @member | all]': 'Purge recent messages',
			'serverinfo': 'Display server info',
			'stop': 'Stop playing music',
			'unpinall': 'Unpins all the pinned messages',
			'whois [@member]': 'Get member info'
		};

		if (message.channel.type === 'dm') {
			delete Commands['membercount'];
			delete Commands['play <song name | youtube video link>'];
			delete Commands['purge [1-100 | @member | all]'];
			delete Commands['serverinfo'];
			delete Commands['stop'];
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