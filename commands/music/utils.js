const { MessageEmbed } = require('discord.js');

const queue = new Map();

class queueConstruct {
	constructor() {
		this.dispatcher = undefined;
		this.songs = new Array();
	}
	get queueList() {
		const songs = this.songs;

		if (songs.length === 0) {
			return 'Type `.s play <song>` to add one.';
		}

		let queueList = new String;
		for (let i = 0; i < songs.length; i++) {
			const song = songs[i];
			queueList += `${i + 1}. ` + `[${song.title}](${song.url})` + '\n';
		}

		return queueList;
	}
}

function Play(message, voiceConnection, ytdl, serverQueue) {
	const song = serverQueue.songs[0];

	const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
	serverQueue.dispatcher = voiceConnection.play(stream, { bitrate: 165, volume: 0.85 });

	serverQueue.dispatcher.on('start', () => {
		message.channel.send(
			new MessageEmbed()
				.setAuthor('Now Playing')
				.setColor('#FF0000')
				.setTitle(song.title)
				.setThumbnail(song.thumbnail)
				.setURL(song.url)
				.setFooter(`Added By ${song.author.tag}`, song.author.displayAvatarURL({ dynamic: true, }))
		);
	});

	serverQueue.dispatcher.on('finish', () => {
		// Remove the song from queue once it is finished.
		serverQueue.songs.shift();

		// If the songs queue list is empty, end the dispatcher and delete serverQueue.
		if (serverQueue.songs.length === 0) {
			message.channel.send(
				new MessageEmbed()
					.setColor('#FF0000')
					.setTitle('Muisc queue ended!')
					.setDescription('Type `.s play <song>` to add one.')
			);
			message.guild.me.voice.channel.leave();
			queue.delete(message.guild.id);
			return;
		}

		// Call the Play function again to play next song.
		Play(message, voiceConnection, ytdl, serverQueue);
	});
}

module.exports = {
	Play,
	queue,
	queueConstruct
};