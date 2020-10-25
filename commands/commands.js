const { MessageEmbed } = require('discord.js');

const getEmbedMessage = (commandsCategory, message) => {
	const { name: categoryName, list: commandsList } = commandsCategory;

	let CommandsDescription = '';
	for (const command in commandsList) {
		CommandsDescription += '`.s ' + command + '`' + '\n' + commandsList[command] + '\n\n';
	}

	return new MessageEmbed()
		.setAuthor(categoryName, message.client.user.displayAvatarURL())
		.setColor('RED')
		.setDescription(CommandsDescription);
};

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds', 'command'],
	permissions: { bot: ['ADD_REACTIONS'] },
	func: async function (message) {
		const commands = [
			{
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
			{
				name: 'Music Commands',
				emoji: '🎵',
				list: {
					'play <song name | youtube video link>': 'Play a song',
					'queue': 'Display music queue',
					'skip': 'Skip song',
					'stop': 'Stop playing'
				}
			},
			{
				name: 'Bot Commands',
				emoji: '🤖',
				list: {
					'about': 'Get info about bot',
					'botdiscord': 'Get bot discord link',
					'botinvite': 'Get bot invite link',
					'version': 'Display bot version'
				}
			}
		];

		let homePageDescription = 'React to get a list of commands\n\n#️⃣ - General commands\n\n🎵 - Music commands\n\n🤖 - Bot commands';

		if (message.channel.type === 'dm') {
			commands.splice(1, 1);
			delete commands[0].list['membercount'];
			delete commands[0].list['purge [1-100 | @member | all]'];
			delete commands[0].list['serverinfo'];
			homePageDescription = homePageDescription.replace('\n\n🎵 - Music commands', '');
		}

		/* .s commands <category name> */
		const userRequestedCommandCategory = message.content.toLowerCase().split(' ')[2];
		for (const commandsCategory in commands) {
			const category = commands[commandsCategory];
			const categoryName = category.name.split(' ')[0].toLowerCase();
			if (userRequestedCommandCategory === categoryName) {
				message.channel.send(getEmbedMessage(category, message));
				return;
			}
		}

		const homePageMessage = await message.channel.send(
			new MessageEmbed()
				.setColor('GREEN')
				.setDescription(homePageDescription)
		);
		let atHomePage = true;

		commands.forEach(category => {
			homePageMessage.react(category.emoji);
		})

		const collectorFilter = reaction => commands.some(category => category.emoji === reaction.emoji.name);
		const collector = homePageMessage.createReactionCollector(collectorFilter, { idle: 72000 });

		collector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) {
				return;
			}

			if (user.id == message.author.id) {
				for (let i = 0; i < commands.length; i++) {
					const category = commands[i];
					if (category.emoji === reaction.emoji.name) {
						homePageMessage.edit(getEmbedMessage(category, message));
						atHomePage = false;
					}
				}
			}

			if (message.channel.type !== 'dm') {
				reaction.users.remove(user.id);
			}
		});

		collector.on('end', collected => {
			collected.forEach(reaction => (message.channel.type === 'dm') ? reaction.users.remove(message.client.user.id) : reaction.remove());

			if (atHomePage) {
				homePageMessage.edit(getEmbedMessage(commands[0], message));
			}
		});
	}
};