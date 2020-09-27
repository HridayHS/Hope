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

client.on('message', async (message) => {
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

	switch (message.content.split(' ')[1]) {
		case 'avatar':
			message.channel.send(message.author.avatarURL({ format: 'jpeg', dynamic: false, size: 1024 }));
			break;
		case 'commands':
			const Commands = {
				avatar: 'Display your avatar',
				pin: 'Pins the message',
				ping: 'Says pong',
				unpinall: 'Unpins all the pinned messages'
			};

			let CommandsDescription = '';
			for (const CommandName in Commands) {
				CommandsDescription += '`.s ' + CommandName + '`' + '\n' + Commands[CommandName] + '\n\n';
			}

			const EmbedMessage = new MessageEmbed()
				.setAuthor('Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('RED')
				.setDescription(CommandsDescription);
			message.channel.send(EmbedMessage);
			break;
		case 'pin':
			const pinMessageContent = message.content;
			const MessageToPin = pinMessageContent
				.substring(pinMessageContent.indexOf(' ') + 1)
				.substring(pinMessageContent.indexOf(' ') + 1);
			message.channel.send(MessageToPin).then(message => message.pin());
			break;
		case 'ping':
			message.channel.send('Pong!');
			break;
		case 'unpinall':
			const fetchPinnedMessages = await message.channel.messages.fetchPinned();
			fetchPinnedMessages.forEach(async (pinnedMessage) => await pinnedMessage.unpin());
			message.channel.send('Unpinned all the pinned messages!');
			break;
		default:
			message.channel.send('Invalid command.');
			break;
	}
});