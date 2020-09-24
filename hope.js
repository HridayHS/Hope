const Config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

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
		case !message.content.startsWith('.h'):
			return;
		case message.content === '.h':
			message.channel.send('Invalid usage.');
			return;
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