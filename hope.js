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
				.setAuthor('Hope Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('GREEN')
				.setDescription('My command prefix is .h');
			message.channel.send(EmbedMessage);
			return;
		case !message.content.startsWith('.h'):
			return;
		case message.content === '.h':
			message.channel.send('Invalid usage.');
			return;
		default:
			break;
	}

	switch (message.content.substring(3)) {
		case 'ping':
			message.channel.send('Pong!');
			break;
		default:
			message.channel.send('Invalid command.');
			break;
	}
});