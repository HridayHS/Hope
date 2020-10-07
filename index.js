const fs = require('fs');
const { Client, Collection, MessageEmbed } = require('discord.js');
const client = new Client();

// Console log when bot is ready.
client.once('ready', () => {
	const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	console.log(`Bot is up | ${new Date().getHours()}:${new Date().getMinutes()}, ${new Date().getDate()} ${Months[new Date().getMonth()]}`);
});

// Initialize login
client.login(require('./config.json').token);

/* Bot */
const botCommands = new Collection();
let commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const commandFile of commandFiles) {
	const command = require(`./src/commands/${commandFile}`);
	botCommands.set(command.name, command);
}

client.on('message', async (message) => {
	const messageContent = message.content.toLowerCase();

	switch (true) {
		case message.channel.type === 'dm':
		case !message.guild.me.permissions.has(['VIEW_CHANNEL', 'SEND_MESSAGES']):
		case message.author.bot:
			return;
		case messageContent === '.s':
		case messageContent === '<@!545420239706521601>':
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', 'https://cdn.discordapp.com/app-icons/545420239706521601/9fb441dfa2135181808a394f8189c2cf.webp')
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
			const botTeamMembers = (await client.fetchApplication()).owner.members;
			if (!botTeamMembers.has(message.author.id)) {
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
				botCommands.set(command.name, command);
			}

			message.channel.send('Bot commands refreshed.');
			return;
		default:
			break;
	}

	const botCommand = botCommands.get(messageContent.split(' ')[1])
		|| botCommands.find(command => command.alias && command.alias.includes(messageContent.split(' ')[1]))

	if (botCommand) {
		if (botCommand.hasOwnProperty('permissions')) {
			const commandPerms = botCommand.permissions;
			if (!message.member.hasPermission(commandPerms)) {
				const missingPerms = [];

				for (let i = 0; i < commandPerms.length; i++) {
					const botPermission = commandPerms[i];
					if (!message.member.hasPermission(botPermission)) {
						missingPerms.push(botPermission);
					}
				}

				const commandPermsHumnanReadable = missingPerms.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
				message.reply(`You do not have the required permissions to perform this action.\nYou need the permissions ${commandPermsHumnanReadable.join(', ')} for this command to work.`);
				return;
			}
		}
		botCommand.func(message);
	} else {
		message.channel.send('**Invalid command.** Use `.s commands` to display bot commands.');
	}
});