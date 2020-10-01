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
		case messageContent === '<@!545420239706521601>':
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Bot Help', 'https://cdn.discordapp.com/avatars/545420239706521601/06cd328d670773df41efe598d2389f52.png')
					.setColor('GREEN')
					.addFields(
						{ name: 'Prefix', value: '`.s`', inline: true },
						{ name: 'Commands', value: '`.s commands`', inline: true }
					)
			);
			return;
		case !messageContent.startsWith('.s'):
			return;
		case !message.guild.me.permissions.has(botPermissions):
			const botPermsHumnanReadable = botPermissions.map(s => s.toLowerCase().replace(/(^|_)./g, s => s.slice(-1).toUpperCase()).replace(/([A-Z])/g, ' $1').trim());
			message.channel.send(`I need the permissions ${botPermsHumnanReadable.join(', ')} for this bot to work properly.`);
			return;
		default:
			break;
	}

	/* Bot Commands */
	switch (messageContent.split(' ')[1]) {
		case 'avatar':
			const avatarAuthor = message.mentions.users.first() || message.author;
			message.channel.send(avatarAuthor.avatarURL({ format: 'png', dynamic: true, size: 4096 }));
			return;
		case 'clear':
			await message.delete();

			const getClearAmount = messageContent.split(' ')[2];

			let clearAmount = parseInt(getClearAmount);
			if (clearAmount < 1) {
				message.reply('Please enter a valid number! [1-100]');
				return;
			}

			clearAmount = (clearAmount >= 100) ? 100 : clearAmount;

			message.channel.messages.fetch({ limit: 1 })
				.then(fetchedMessage => {
					if (Date.now() - fetchedMessage.first().createdAt.getTime() > 1209600000) {
						message.channel.send('Unable to clear messages older than 14 days.');
						return;
					}

					message.channel.bulkDelete(clearAmount || 1, true)
						.catch(() => {
							message.channel.send('Failed to clear recent messages!');
						});
				})
				.catch(() => {
					message.channel.send('Failed to clear recent messages!');
				});
			return;
		case 'commands':
			const Commands = {
				'avatar [@user]': 'Display avatar',
				'clear [1-100]': 'Clears recent messages',
				'pin <message>': 'Pins the message',
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
			return;
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
			return;
		case 'ping':
			message.channel.send('Pong!');
			return;
		case 'unpinall':
			await message.channel.messages.fetchPinned()
				.then(pinnedMessages => {
					for (const [key, pinnedMessage] of pinnedMessages) {
						pinnedMessage.unpin().catch(() => message.channel.send(`Failed to unpin ${pinnedMessage.url}`));
					}
				})
				.catch(() => {
					message.channel.send('Unpinning failed!')
				});

			message.channel.send('Unpinned all the pinned messages!');
			return;
		default:
			message.channel.send('**Invalid command.** Use `.s commands` to show all the bot commands.');
			return;
	}
});