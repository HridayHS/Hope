const { getAllFiles } = require('./utils.js');

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
const { botIconURL } = require('./utils');
const botCommands = new Collection();

let commandFiles = getAllFiles('./src/commands').filter(file => file.endsWith('.js'));

for (const commandFile of commandFiles) {
	const command = require(`./${commandFile}`);
	botCommands.set(command.name, command);
}

client.on('message', async (message) => {
	const messageContent = message.content.toLowerCase();

	switch (true) {
		case message.channel.type !== 'dm' && !message.guild.me.permissions.has(['SEND_MESSAGES']):
		case message.author.bot:
			return;
		case messageContent === '.s':
		case messageContent === '.s help':
		case messageContent === '<@!545420239706521601>':
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', botIconURL)
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
			if (message.author.id !== (await client.fetchApplication()).owner.ownerID) {
				message.reply('You cannot perform this action.');
				return;
			}

			commandFiles.forEach(commandFile => delete require.cache[require.resolve(`./${commandFile}`)]);

			botCommands.clear();

			commandFiles = getAllFiles('./src/commands').filter(file => file.endsWith('.js'));

			for (const commandFile of commandFiles) {
				const command = require(`./${commandFile}`);
				botCommands.set(command.name, command);
			}

			message.channel.send('Bot commands refreshed.');
			return;
	}

	const botCommand = botCommands.get(messageContent.split(' ')[1])
		|| botCommands.find(command => command.alias && command.alias.includes(messageContent.split(' ')[1]))

	if (botCommand) {
		// Check if command is guild only
		if (botCommand.guildOnly && message.channel.type === 'dm') {
			return;
		}

		// Check if bot and member both have the required permission to execute the command.
		function permissionsCheck(botPerms = false) {
			if (!botCommand.permissions) {
				return true;
			}

			const Perms = botCommand.permissions[botPerms ? 'bot' : 'member'];
			const hasPermissions = botPerms ? message.guild.me.permissions.has(Perms) : message.member.hasPermission(Perms);
			if (Perms && !hasPermissions) {
				const missingPerms = [];

				for (let i = 0; i < Perms.length; i++) {
					const Permission = Perms[i];
					const hasPermission = botPerms ? message.guild.me.permissions.has(Permission) : message.member.hasPermission(Permission)
					if (!hasPermission) {
						missingPerms.push(Permission);
					}
				}

				const PermsHumnanReadable = missingPerms.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
				message.channel.send(`${botPerms ? 'I' : `<@${message.author.id}>, You`} do not have the required permissions to perform this action.\n${botPerms ? 'Bot' : 'You'} need the permissions ${PermsHumnanReadable.join(', ')} for this command to work.`);
				return false;
			}
			return true;
		}

		if (message.channel.type !== 'dm' && (!permissionsCheck(true) || !permissionsCheck())) {
			return;
		}

		botCommand.func(message);
	} else {
		message.channel.send('**Invalid command.** Use `.s commands` to display bot commands.');
	}
});