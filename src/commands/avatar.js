module.exports = {
	name: 'avatar',
	guildOnly: true,
	func: function (message) {
		const avatarAuthor = message.mentions.users.first() || message.author;
		message.channel.send(avatarAuthor.avatarURL({ format: 'png', dynamic: true, size: 4096 }));
	}
};