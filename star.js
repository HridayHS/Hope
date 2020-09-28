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
		case !message.content.startsWith('.s'):
		case message.author.bot:
			return;
		case message.content === '.s':
		case message.mentions.users.has('545420239706521601'):
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
					.setColor('GREEN')
					.addFields(
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true }

					)
			).catch(console.error);
			return;
		default:
			break;
	}

	/* Bot Commands */
	switch (message.content.split(' ')[1]) {
		case 'avatar':
			message.channel.send(message.author.avatarURL({ format: 'jpeg', dynamic: false, size: 1024 }))
				.catch(console.error);
			break;
		case 'clear':
			const getAmountOfMessagesToClear = message.content.split(' ')[2];

			if (getAmountOfMessagesToClear) {
				const isValidNumber = parseInt(getAmountOfMessagesToClear);
				if (!isValidNumber || isValidNumber < 1) {
					message.reply('Please enter a valid number! [1-100]')
						.catch(console.error);
					break;
				}
			}

			const amountOfMessagesToClear = () => {
				const amount = getAmountOfMessagesToClear;
				return (amount < 99) ? amount + 1
					: (amount >= 100) ? 100
						: NaN;
			};

			message.channel.bulkDelete(amountOfMessagesToClear() || 2)
				.catch(console.error);
			break;
		case 'commands':
			const Commands = {
				'avatar': 'Display your avatar',
				'clear [1-100]': 'Delete recent messages',
				'pin': 'Pins the message',
				'ping': 'Says pong',
				'unpinall': 'Unpins all the pinned messages'
			};

			let CommandsDescription = '';
			for (const CommandName in Commands) {
				CommandsDescription += '`.s ' + CommandName + '`' + '\n' + Commands[CommandName] + '\n\n';
			}

			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
					.setColor('RED')
					.setDescription(CommandsDescription)
			).catch(console.error);
			break;
		case 'pin':
			const userMessage = message.content;
			const MessageToPin = userMessage
				.substring(userMessage.indexOf(' ') + 1)
				.substring(userMessage.indexOf(' ') + 1);

			message.channel.send(MessageToPin)
				.then(MessageToPin => MessageToPin.pin().catch(console.error))
				.catch(console.error);
			break;
		case 'ping':
			message.channel.send('Pong!')
				.then(console.error);
			break;
		case 'unpinall':
			const fetchPinnedMessages = await message.channel.messages.fetchPinned();
			fetchPinnedMessages.forEach(pinnedMessage => pinnedMessage.unpin().catch(console.error));

			message.channel.send('Unpinned all the pinned messages!')
				.catch(console.error);
			break;
		default:
			message.channel.send('Invalid command.')
				.catch(console.error);
			break;
	}
});