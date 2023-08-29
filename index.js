const { Client, Collection, Colors, ChannelType, GatewayIntentBits, Partials } = require('discord.js');

const botIntents = [
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageReactions,
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildWebhooks,
	GatewayIntentBits.MessageContent
];

const client = new Client({ intents: botIntents, partials: [Partials.Channel, Partials.Message] });

// Console log when bot is ready.
client.once('ready', () => {
	const date = new Date();
	const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	console.log(`Bot is up | ${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${Months[date.getMonth()]}`);
});

// Initialize login
client.login(require('./config.json').token);

/* Bot */
const { getAllFiles, hasCommandPermissions } = require('./utils');

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
		case message.channel.type !== ChannelType.DM && !message.guild.members.me.permissions.has(['SendMessages']):
		case message.author.bot:
			return;
		case messageContent === '.s':
		case messageContent === '.s help':
		case messageContent === '<@!545420239706521601>':
			message.channel.send({
				embeds: [{
					author: {
						name: 'Bot Help',
						iconURL: client.user.displayAvatarURL(),
					},
					color: Colors.Green,
					fields: [
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true },
						{ name: 'About', value: '`.s about`', inline: true }
					]
				}]
			});
			return;
		case messageContent.split(' ')[0] !== '.s':
			return;
		case commandReceived === 'refresh':
			const clientApplication = await client.application.fetch();
			const botOwnerId = clientApplication.owner.ownerId;

			if (message.author.id !== botOwnerId) {
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
		// Return if guild only command is requested in DM channel.
		if (botCommand.guildOnly && message.channel.type === ChannelType.DM) {
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