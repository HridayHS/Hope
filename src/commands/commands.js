const { MessageEmbed } = require('discord.js');
const { botIconURL } = require('../../utils');

const getEmbedMessage = (commandsCategory, message) => {
	const { name: categoryName, list: commandsList } = commandsCategory;

	let CommandsDescription = '';
	for (const CommandName in commandsList) {
		CommandsDescription += '`.s ' + CommandName + '`' + '\n' + commandsList[CommandName] + '\n\n';
	}

	return new MessageEmbed()
		.setAuthor(categoryName, message.client.user.displayAvatarURL())
		.setColor('RED')
		.setDescription(CommandsDescription)
};

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds', 'command'],
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
					'stop': 'Stop playing'
				}
			},
			{
				name: 'Bot Commands',
				emoji: '🤖',
				list: {
					'about': 'Get info about bot',
					'botdiscord': 'Get bot discord link',
					'botinvite': 'Get bot invite link'
				}
			}
		];

		let commandMessageDescription = 'React to get a list of commands\n\n#️⃣ - General commands\n\n🎵 - Music commands\n\n🤖 - Bot commands';

		if (message.channel.type === 'dm') {
			commands.splice(1, 1);
			delete commands[0].list['membercount'];
			delete commands[0].list['purge [1-100 | @member | all]'];
			delete commands[0].list['serverinfo'];
			commandMessageDescription = commandMessageDescription.replace('\n\n🎵 - Music commands', '');
		}

		const commandMessage = await message.channel.send(
			new MessageEmbed()
				.setColor('GREEN')
				.setDescription(commandMessageDescription)
		);
		let atHomePage = true;

		commands.forEach(commandsCategory => {
			commandMessage.react(commandsCategory.emoji);
		})

		const filter = reaction => commands.some(commandsCategory => commandsCategory.emoji === reaction.emoji.name);
		const collector = commandMessage.createReactionCollector(filter, { idle: 72000 });

		collector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) {
				return;
			}

			if (user.id == message.author.id) {
				for (let i = 0; i < commands.length; i++) {
					const category = commands[i];
					if (category.emoji === reaction.emoji.name) {
						commandMessage.edit(getEmbedMessage(category, message));
						atHomePage = false;
					}
				}
			}

			if (message.channel.type !== 'dm') {
				reaction.users.remove(user.id);
			}
		});

		collector.on('end', collected => {
			if (message.channel.type !== 'dm') {
				collected.every(reaction => reaction.remove());
			}
			if (atHomePage) {
				commandMessage.edit(getEmbedMessage(commands[0], message));
			}
		});
	}
};