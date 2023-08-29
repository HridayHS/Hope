const { ActivityType, ChannelType } = require('discord.js');

class Emoji {
	constructor(emoji) {
		this.emojiInfo = emoji.slice(1).slice(0, -1).split(':');
	}

	get url() {
		const emojiID = this.emojiInfo[2];
		const emojiExtention = this.emojiInfo.includes('a') ? 'gif' : 'png';
		return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtention}`;
	}
}

async function getUser(message) {
	const userID = message.content.split(' ')[2];
	const userMention = message.mentions.users.first();
	return userMention ?? await message.client.users.fetch(userID, { cache: true, force: true }).catch(() => {});
};

module.exports = {
	name: 'emojilink',
	alias: ['e', 'emoji', 'emote', 'emotelink', 'elink'],
	func: async function (message) {
		const Emojis = message.content.match(/(<:|<a:)+[^:]+:[0-9]+>/g);
		const user = await getUser(message);

		if (!Emojis && !user) {
			message.channel.send('Invalid custom emoji.');
			return;
		}

		const canBotSendFiles = (message.channel.type === ChannelType.DM) ? true
			: message.channel.permissionsFor(message.guild.members.me).has('AttachFiles');
		const isLinkNeeded = message.content.match('link');
		const isMessageDeletionRequired = message.channel.type !== ChannelType.DM && message.content.match('delete');

		/* Custom emoji from message content. */
		if (Emojis) {
			// Delete user message if deletion is required.
			if (isMessageDeletionRequired) {
				message.delete();
			}

			// Send upto five Emojis for DMChannel and only one for other ones.
			const amountOfEmojisToSend = (message.channel.type === ChannelType.DM) ? Math.min(Emojis.length, 5) : 1;

			for (let i = 0; i < amountOfEmojisToSend; i++) {
				const EmojiURL = new Emoji(Emojis[i]).url;
				message.channel.send(
					isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
					(isLinkNeeded && canBotSendFiles) ? { files: [EmojiURL] } : null // Message options
				);
			}
			return;
		}

		/* Custom emoji from user custom status */
		if (user) {
			const guildMember = await message.guild.members.fetch({ user, cache: true, force: true, withPresences: true });

			if (guildMember.size == 0) {
				message.reply('Not a guild member.');
				return;
			}

			const userActivities = guildMember.presence.activities;

			if (userActivities.length === 0) {
				message.channel.send('Unable to retrieve emoji.');
				return;
			}

			for (let i = 0; i < userActivities.length; i++) {
				const activity = userActivities[i];

				// Skip if activity type isn't custom status.
				if (activity.type !== ActivityType.Custom) continue;

				const Emoji = activity.emoji;
				if (!Emoji || !Emoji.id) {
					message.channel.send('Custom emoji not found!');
					return;
				}

				// Delete user message if deletion is required.
				if (isMessageDeletionRequired) {
					message.delete();
				}

				const EmojiID = Emoji.id;
				const EmojiExtention = Emoji.animated ? 'gif' : 'png';
				const EmojiURL = `https://cdn.discordapp.com/emojis/${EmojiID}.${EmojiExtention}`;

				message.channel.send(
					isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
					(isLinkNeeded && canBotSendFiles) ? { files: [EmojiURL] } : null // Message options
				);

				return;
			}
		}
	}
};