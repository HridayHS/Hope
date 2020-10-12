module.exports = {
	name: 'emoji',
	alias: ['e', 'emote', 'emotelink', 'emojilink', 'elink'],
	func: async function (message) {
		const Emojis = message.content.match(/(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g);

		if (!Emojis) {
			message.channel.send('Invalid emoji.');
			return;
		}

		const Emoji = {
			info: undefined,
			get url() {
				const emojiID = this.info[2];
				const emojiExtention = this.info.includes('a') ? 'gif' : 'png';
				return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtention}`;
			}
		};

		if (message.channel.type === 'dm') {
			for (let i = 0; i < (Emojis.length > 5 ? 5 : Emojis.length); i++) {
				Emoji.info = Emojis[i].slice(1).slice(0, -1).split(':');
				message.channel.send(`<${Emoji.url}>`, { files: [Emoji.url] });
			}
			return;
		}

		Emoji.info = Emojis[0].slice(1).slice(0, -1).split(':');
		message.channel.send(`<${Emoji.url}>`, { files: [Emoji.url] });
	}
};