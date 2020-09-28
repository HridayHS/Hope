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
	const messageContent = message.content.toLowerCase();

	switch (true) {
		case message.author.bot: // Return if messages are from a bot.
			return;
		case messageContent === '.s': // Send bot help message if only bot prefix is used.
		case message.mentions.users.has('545420239706521601') && messageContent === '<@!545420239706521601>': // Send help message if only bot is tagged.
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
		case !messageContent.startsWith('.s'): // Return if message doesn't start with bot prefix.
			return;
		default:
			break;
	}

	/* Bot Commands */
	switch (messageContent.split(' ')[1]) {
		case 'avatar':
			const mentionedUser = message.mentions.users.first();
			if (mentionedUser) { // if a user is mentioned display his avatar
				message.channel.send(mentionedUser.avatarURL({ format: 'png', dynamic: true, size: 4096 }))
					.catch(console.error);
			} else { // if a user is not mentioned display authors avatar
				message.channel.send(message.author.avatarURL({ format: 'png', dynamic: true, size: 4096 }))
					.catch(console.error);
			}
			break;
		case 'clear':
			const getAmountOfMessagesToClear = messageContent.split(' ')[2];

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
				.catch(() => message.channel.send('Failed to clear recent messages!').catch(console.error));
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
				.then(MessageToPin => MessageToPin.pin().catch(() => message.channel.send('Failed to pin the message!').catch(console.error)))
				.catch(() => message.channel.send('Failed to pin the message!').catch(console.error));
			break;
		case 'ping':
			message.channel.send('Pong!')
				.then(console.error);
			break;
		case 'unpinall':
			try {
				const pinnedMessages = await message.channel.messages.fetchPinned();
				if (pinnedMessages) {
					for (const [key, value] of pinnedMessages) {
						const pinnedMessage = value;
						try {
							await pinnedMessage.unpin();
						} catch (error) {
							message.channel.send(`Failed to unpin ${pinnedMessage.url}`)
								.catch(console.error);
						}
					}
				}
			} catch (error) {
				message.channel.send('Unpinning failed!').catch(console.error);
				console.error(error);
			}

			message.channel.send('Unpinned all the pinned messages!')
				.catch(console.error);
			break;
		default:
			message.channel.send('**Invalid command.** Use `.s commands` to show all the bot commands.')
				.catch(console.error);
			break;
	}
});