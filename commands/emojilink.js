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
				message.channel.send(
					isLinkNeeded ? `<${Emoji.url}>` : Emoji.url, // Message content
					isLinkNeeded ? { files: [Emoji.url] } : null // Message options
				);
			}
			return;
		}

		const canSendFiles = message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES');
		Emoji.info = Emojis[0].slice(1).slice(0, -1).split(':');

		message.channel.send(
			isLinkNeeded ? `<${Emoji.url}>` : Emoji.url, // Message content
			(isLinkNeeded && canSendFiles) ? { files: [Emoji.url] } : null // Message options
		);
	}
};