const botCommands = [
	{
		name: 'General Commands',
		emoji: '#️⃣',
		list: {
			'avatar [@member]': 'Get avatar',
			'emoji <custom emoji OR @member> [link] [delete]': 'Get emoji link',
			'fetchemoji <guild id>': `Fetches guild's all emojis`,
			'pin <message>': 'Pin message',
			'ping': 'Says pong',
			'unpinall': 'Unpins all the pinned messages',
			'whois [@member]': 'Get member info'
		}
	},
	{
		name: 'Server Commands',
		emoji: '⚙️',
		list: {
			'membercount': 'Get members count',
			'purge [1-100] OR [@member] OR [all]': 'Purge recent messages',
			'serverbanner': 'Get server banner',
			'servericon': 'Get server icon',
			'serverinfo': 'Get server info'
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

const getEmbedMessage = (commandsCategory, message) => {
	const { name: categoryName, list: commandsList } = commandsCategory;

	let CommandsDescription = '';
	for (const command in commandsList) {
		CommandsDescription += '`.s ' + command + '`' + '\n' + commandsList[command] + '\n\n';
	}

	return {
		color: 'RED',
		author: {
			name: categoryName,
			iconURL: message.client.user.displayAvatarURL()
		},
		description: CommandsDescription
	};
};

module.exports = {
	name: 'commands',
	alias: ['cmd', 'cmds', 'command'],
	permissions: { bot: ['ADD_REACTIONS'] },
	func: async function (message) {
		const commands = [...botCommands];

		// Remove Server and Music commands for DMChannel.
		if (message.channel.type == 'DM') {
			commands.splice(1, 2);
		}

		let homePageDescription = 'React to get a list of commands';
		commands.forEach(category => homePageDescription += `\n\n${category.emoji} - ${category.name.replace('Commands', 'commands')}`);

		/* .s commands <category name> */
		const userRequestedCommandCategory = message.content.toLowerCase().split(' ')[2];
		for (const commandsCategory in commands) {
			const category = commands[commandsCategory];
			const categoryName = category.name.split(' ')[0].toLowerCase();
			if (userRequestedCommandCategory === categoryName) {
				message.channel.send({ embeds: [getEmbedMessage(category, message)] });
				return;
			}
		}

		const homePageMessage = await message.channel.send({
			embeds: [{
				color: 'GREEN',
				description: homePageDescription
			}]
		});

		let atHomePage = true;

		commands.forEach(category => homePageMessage.react(category.emoji));

		const collectorFilter = reaction => commands.some(category => category.emoji === reaction.emoji.name);
		const collector = homePageMessage.createReactionCollector({ collectorFilter, idle: 72000 });

		collector.on('collect', (reaction, user) => {
			if (user.id == message.client.user.id) {
				return;
			}

			if (user.id == message.author.id) {
				for (let i = 0; i < commands.length; i++) {
					const category = commands[i];
					if (category.emoji === reaction.emoji.name) {
						homePageMessage.edit({ embeds: [getEmbedMessage(category, message)] });
						atHomePage = false;
					}
				}
			}

			if (message.channel.type != 'DM') {
				reaction.users.remove(user.id);
			}
		});

		collector.on('end', collected => {
			collected.forEach(reaction => (message.channel.type == 'DM') ? reaction.users.remove(message.client.user.id) : reaction.remove());

			if (atHomePage) {
				homePageMessage.edit({ embeds: [getEmbedMessage(commands[0], message)] });
			}
		});
	}
};