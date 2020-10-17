const { MessageEmbed } = require('discord.js');

const commands = {
	general: {
		name: 'General Commands',
		emoji: '#️⃣',
		list: {
			'avatar [@member]': 'Get avatar',
			'emoji <custom emoji>': 'Get emoji link',
			'membercount': 'Get members count',
			'pin <message>': 'Pin message',
			'ping': 'Says pong',
			'purge [1-100 | @member | all]': 'Purge recent messages',
			'serverinfo': 'Get server info',
			'unpinall': 'Unpins all the pinned messages',
			'whois [@member]': 'Get member info'
		}
	},
	music: {
		name: 'Music Commands',
		emoji: '🎵',
		list: {
			'play <song name | youtube video link>': 'Play a song',
			'stop': 'Stop playing'
		}
	},
	bot: {
		name: 'Bot Commands',
		emoji: '🤖',
		list: {
			'about': 'Get info about bot',
			'botdiscord': 'Get bot discord link',
			'botinvite': 'Get bot invite link'
		}
	},
	getEmbedMessage(commandsCategory) {
		const { name: categoryName, list: commandsList } = commandsCategory;

		let CommandsDescription = '';
		for (const CommandName in commandsList) {
			CommandsDescription += '`.s ' + CommandName + '`' + '\n' + commandsList[CommandName] + '\n\n';
		}

		return new MessageEmbed()
			.setAuthor(categoryName, 'https://cdn.discordapp.com/app-icons/545420239706521601/9fb441dfa2135181808a394f8189c2cf.webp')
			.setColor('RED')
			.setDescription(CommandsDescription)
	}
};

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds', 'command'],
	func: async function (message) {
		if (message.channel.type === 'dm') {
			delete commands['music'];
			delete commands.general.list['membercount'];
			delete commands.general.list['purge [1-100 | @member | all]'];
			delete commands.general.list['serverinfo'];
		}

		let commandMessageDescription = 'React to get a list of commands\n\n#️⃣ - General commands\n\n🎵 - Music commands\n\n🤖 - Bot commands';
		if (message.channel.type === 'dm') {
			commandMessageDescription = commandMessageDescription.replace('\n\n🎵 - Music commands', '');
		}

		const commandMessage = await message.channel.send(
			new MessageEmbed()
				.setColor('GREEN')
				.setDescription(commandMessageDescription)
		);

		for (const commandCategory in commands) {
			if (commandCategory === 'getEmbedMessage') {
				continue;
			}

			const emoji = commands[commandCategory].emoji;
			const category = commands[commandCategory];

			await commandMessage.react(emoji);
			commandMessage.awaitReactions((reaction, user) => reaction.emoji.name === emoji && user.id == message.author.id, { max: 1, maxUser: 1 })
				.then(reactions => {
					commandMessage.edit(commands.getEmbedMessage(category));
					if (message.channel.type !== 'dm') {
						reactions.first().remove();
					}
				});
		}
	}
};