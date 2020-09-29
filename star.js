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

const botPermissions = ['MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'];

client.on('message', async (message) => {
	const messageContent = message.content.toLowerCase();

	switch (true) {
		case message.author.bot:
			return;
		case messageContent === '.s':
		case message.mentions.users.has('545420239706521601') && messageContent === '<@!545420239706521601>':
			return message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
					.setColor('GREEN')
					.addFields(
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true }
					)
			);
		case !messageContent.startsWith('.s'):
			return;
		case !message.guild.me.permissions.has(botPermissions):
			const botPermsHumnanReadable = botPermissions.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
			return message.channel.send(`I need the permissions ${botPermsHumnanReadable.join(', ')} for this bot to work properly.`);
		default:
			break;
	}

	/* Bot Commands */
	switch (messageContent.split(' ')[1]) {
		case 'avatar':
			const mentionedUser = message.mentions.users.first();
			if (mentionedUser) {
				message.channel.send(mentionedUser.avatarURL({ format: 'png', dynamic: true, size: 4096 }));
			} else {
				message.channel.send(message.author.avatarURL({ format: 'png', dynamic: true, size: 4096 }));
			}
			break;
		case 'clear':
			const getAmountOfMessagesToClear = messageContent.split(' ')[2];

			const isValidNumber = parseInt(getAmountOfMessagesToClear);
			if (getAmountOfMessagesToClear) {
				if (!isValidNumber || isValidNumber < 1) {
					message.reply('Please enter a valid number! [1-100]');
					break;
				}
			}

			const amountOfMessagesToClear = () => {
				const amount = isValidNumber;
				return (amount < 99) ? amount + 1
					: (amount >= 100) ? 100
						: NaN;
			};

			message.channel.bulkDelete(amountOfMessagesToClear() || 2, true)
				.catch(async () => {
					await message.channel.send('Failed to clear recent messages!');
					message.delete(); // Delete command message as command failed to work
				});
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
			);
			break;
		case 'pin':
			const userMessage = message.content;
			const MessageToPin = userMessage
				.substring(userMessage.indexOf(' ') + 1)
				.substring(userMessage.indexOf(' ') + 1);

			message.channel.send(MessageToPin)
				.then(MessageToPin => {
					MessageToPin.pin()
						.catch(() => message.channel.send('Failed to pin the message!'));
				})
				.catch(() => message.channel.send('Failed to pin the message!'));
			break;
		case 'ping':
			message.channel.send('Pong!');
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
							message.channel.send(`Failed to unpin ${pinnedMessage.url}`);
						}
					}
				}
			} catch (error) {
				message.channel.send('Unpinning failed!').catch(console.error);;
			}

			message.channel.send('Unpinned all the pinned messages!');
			break;
		default:
			message.channel.send('**Invalid command.** Use `.s commands` to show all the bot commands.');
			break;
	}
});