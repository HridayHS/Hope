const Config = require('./config.json');
const { Client, MessageEmbed } = require('discord.js');

const client = new Client();

// Console log when bot is ready.
client.once('ready', () => {
	const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	console.log(`Bot is up | ${new Date().getHours()}:${new Date().getMinutes()}, ${new Date().getDate()} ${Months[new Date().getMonth()]}`);
});

// Initialize login
client.login(Config.token);

client.on('message', message => {
	switch (true) {
		case message.author.id === '545420239706521601':
			return;
		case message.mentions.users.has('545420239706521601'):
			const EmbedMessage = new MessageEmbed()
				.setAuthor('Bot Help', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('GREEN')
				.addFields(
					{ name: 'Prefix', value: '`.s`', inline: true },
					{ name: 'Commands', value: '`.s commands`', inline: true }
				);
			message.channel.send(EmbedMessage);
			return;
		case !message.content.startsWith('.s'):
			return;
		case message.content === '.s':
			message.channel.send('Invalid usage.');
			return;
		default:
			break;
	}

	switch (message.content.substring(3)) {
		case 'avatar':
			message.channel.send(message.author.avatarURL({ format: 'jpeg', dynamic: false, size: 1024 }));
			break;
		case 'commands':
			const Commands = {
				avatar: 'Display your avatar',
				ping: 'Says pong'
			}

			let CommandsDescription = '';
			for (const commandName in Commands) {
				CommandsDescription += '`.s ' + commandName + '`' + '\n' + Commands[commandName] + '\n\n';
			}

			const EmbedMessage = new MessageEmbed()
				.setAuthor('Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('RED')
				.setDescription(CommandsDescription);
			message.channel.send(EmbedMessage);
			break;
		case 'ping':
			message.channel.send('Pong!');
			break;
		default:
			message.channel.send('Invalid command.');
			break;
	}
});