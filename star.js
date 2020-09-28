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

			const EmbedMessage = new MessageEmbed()
				.setAuthor('Bot Commands', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
				.setColor('RED')
				.setDescription(CommandsDescription);

			message.channel.send(EmbedMessage)
				.catch(console.error);
			break;
		case 'pin':
			const pinMessageContent = message.content;
			const MessageToPinSubstring = pinMessageContent
				.substring(pinMessageContent.indexOf(' ') + 1)
				.substring(pinMessageContent.indexOf(' ') + 1);

			try {
				const MessageToPin = await message.channel.send(MessageToPinSubstring);
				MessageToPin.pin()
					.catch(console.error);
			} catch (error) {
				console.log(erorr);
			}

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
			message.channel.send('**Invalid command.** Use `.s commands` to show all the bot commands.')
				.catch(console.error);
			break;
	}
});