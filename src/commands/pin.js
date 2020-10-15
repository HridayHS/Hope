module.exports = {
	name: 'pin',
	permissions: { bot: ['MANAGE_CHANNELS'], member: ['MANAGE_CHANNELS'] },
	func: function (message) {
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
	}
};