class Emoji {
	constructor(info) {
		this.info = info;
	}

	get url() {
		const emojiID = this.info[2];
		const emojiExtention = this.info.includes('a') ? 'gif' : 'png';
		return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtention}`;
	}
}

module.exports = {
	name: 'emojilink',
	alias: ['e', 'emoji', 'emote', 'emotelink', 'elink'],
	func: function (message) {
		const Emojis = message.content.match(/(<:|<a:)+[^:]+:[0-9]+>/g);
		const isLinkNeeded = message.content.match('link');

		if (!Emojis) {
			message.channel.send('Invalid emoji.');
			return;
		}

		if (message.channel.type === 'dm') {
			for (let i = 0; i < Emojis.length; i++) {
				if (i === 5) break; // Don't send emoji links more than 5.

				const EmojiInfo = Emojis[i].slice(1).slice(0, -1).split(':');
				const EmojiURL = new Emoji(EmojiInfo).url

				message.channel.send(
					isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
					isLinkNeeded ? { files: [EmojiURL] } : null // Message options
				);
			}
			return;
		}

		const EmojiInfo = Emojis[0].slice(1).slice(0, -1).split(':');
		const EmojiURL = new Emoji(EmojiInfo).url

		const canBotSendFiles = message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES');

		message.channel.send(
			isLinkNeeded ? `<${EmojiURL}>` : EmojiURL, // Message content
			(isLinkNeeded && canBotSendFiles) ? { files: [EmojiURL] } : null // Message options
		);
	}
};