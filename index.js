const { Client, Collection, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_WEBHOOKS] });

const { getAllFiles, hasCommandPermissions } = require('./utils');

// Console log when bot is ready.
client.once('ready', () => {
	const date = new Date();
	const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	console.log(`Bot is up | ${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${Months[date.getMonth()]}`);
});

// Initialize login
client.login(require('./config.json').token);

/* Bot */
const botCommands = new Collection();

let commandFiles = getAllFiles('./commands').filter(file => file.endsWith('.js'));

for (const commandFile of commandFiles) {
	const command = require(`./${commandFile}`);
	botCommands.set(command.name, command);
}

client.on('messageCreate', async (message) => {
	const messageContent = message.content.toLowerCase();
	const commandReceived = messageContent.split(' ')[1];

	switch (true) {
		case message.channel.type !== 'dm' && !message.guild.me.permissions.has(['SEND_MESSAGES']):
		case message.author.bot:
			return;
		case messageContent === '.s':
		case messageContent === '.s help':
		case messageContent === '<@!545420239706521601>':
			message.channel.send({
				embed: {
					author: {
						name: 'Bot Help',
						icon_url: client.user.displayAvatarURL(),
					},
					color: 'GREEN',
					fields: [
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true },
						{ name: 'About', value: '`.s about`', inline: true }
					]
				}
			});
			return;
		case messageContent.split(' ')[0] !== '.s':
			return;
		case commandReceived === 'refresh':
			if (message.author.id !== (await client.fetchApplication()).owner.ownerID) {
				message.reply('You cannot perform this action.');
				return;
			}

			commandFiles.forEach(commandFile => delete require.cache[require.resolve(`./${commandFile}`)]);

			botCommands.clear();

			commandFiles = getAllFiles('./commands').filter(file => file.endsWith('.js'));

			for (const commandFile of commandFiles) {
				const command = require(`./${commandFile}`);
				botCommands.set(command.name, command);
			}

			message.channel.send('Bot commands refreshed.');
			return;
	}

	const botCommand = botCommands.get(commandReceived)
		|| botCommands.find(command => command.alias && command.alias.includes(commandReceived));

	if (botCommand) {
		// Check if command is guild only
		if (botCommand.guildOnly && message.channel.type === 'dm') {
			return;
		}

		// Return if bot/member does not have required permissions to use the command.
		if (!hasCommandPermissions(message, botCommand, true)
			|| !hasCommandPermissions(message, botCommand)) {
			return;
		}

		botCommand.func(message);
	} else {
		message.channel.send('**Invalid command.** Use `.s commands` to get the list commands.');
	}
});