const fs = require('fs');
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

// Console log when bot is ready.
client.once('ready', () => {
	const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	console.log(`Bot is up | ${new Date().getHours()}:${new Date().getMinutes()}, ${new Date().getDate()} ${Months[new Date().getMonth()]}`);
});

// Initialize login
client.login(require('./config.json').token);

/* Bot */
const botCommands = new Map();
let commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const commandFile of commandFiles) {
	const command = require(`./src/commands/${commandFile}`);
	botCommands.set(command.name, command.func);
}

const botPermissions = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'];

client.on('message', async (message) => {
	const messageContent = message.content.toLowerCase();

	switch (true) {
		case !message.guild.me.permissions.has(['VIEW_CHANNEL', 'SEND_MESSAGES']):
		case message.author.bot:
			return;
		case messageContent === '.s':
		case messageContent === '<@!545420239706521601>':
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
					.setColor('GREEN')
					.addFields(
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true }
					)
			);
			return;
		case !messageContent.startsWith('.s'):
			return;
		case messageContent.split(' ')[1] === 'refresh':
			const ClientApplication = await client.fetchApplication();
			if (message.author.id !== ClientApplication.owner.id) {
				message.reply('Only bot owner can perform this.');
				return;
			}

			for (const commandFile of commandFiles) {
				delete require.cache[require.resolve(`./src/commands/${commandFile}`)];
			}
			botCommands.clear();

			commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
			for (const commandFile of commandFiles) {
				const command = require(`./src/commands/${commandFile}`);
				botCommands.set(command.name, command.func);
			}

			message.channel.send('Bot commands refreshed.');
			return;
		case !message.guild.me.permissions.has('ADMINISTRATOR'):
			const missingPerms = [];

			for (let i = 0; i < botPermissions.length; i++) {
				const botPermission = botPermissions[i];
				if (!message.guild.me.permissions.has(botPermission)) {
					missingPerms.push(botPermission);
				}
			}

			const botPermsHumnanReadable = missingPerms.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
			message.channel.send(`I need the permissions ${botPermsHumnanReadable.join(', ')} for this bot to work properly.`);
			return;
		default:
			break;
	}

	const botCommand = botCommands.get(messageContent.split(' ')[1]);
	botCommand ? botCommand(message) : message.channel.send('**Invalid command.** Use `.s commands` to display bot commands.');
});