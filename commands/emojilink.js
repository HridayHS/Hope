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

module.exports = {
	name: 'emojilink',
	alias: ['e', 'emoji', 'emote', 'emotelink', 'elink'],
	func: function (message) {
		const Emojis = message.content.match(/(<:|<a:)+[^:]+:[0-9]+>/g);

		if (!Emojis) {
			message.channel.send('Invalid emoji.');
			return;
		}

		const isLinkNeeded = message.content.match('link');

		if (message.channel.type === 'dm') {
			for (let i = 0; i < Emojis.length; i++) {
				if (i === 5) break; // Don't send emoji links more than 5.

				const EmojiURL = new Emoji(Emojis[i]).url;

				message.channel.send(
					isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
					isLinkNeeded ? { files: [EmojiURL] } : null // Message options
				);
			}
			return;
		}

		// Delete user message if deletion is required.
		const isMessageDeletionRequired = message.content.match('delete');
		if (isMessageDeletionRequired) {
			message.delete();
		}

		const canBotSendFiles = message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES');
		const EmojiURL = new Emoji(Emojis[0]).url;

		message.channel.send(
			isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
			(isLinkNeeded && canBotSendFiles) ? { files: [EmojiURL] } : null // Message options
		);
	}
};