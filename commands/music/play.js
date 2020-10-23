const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

const youtube = new YouTube(require('../../config.json')["youtube-data-api-key"]);

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

module.exports = {
	name: 'play',
	alias: ['p'],
	guildOnly: true,
	func: async function (message) {
		const userMessage = message.content.split(' ').slice(2).join(' ');
		if (userMessage === '') {
			message.channel.send('Please provide a song name or a youtube video link!');
			return;
		}

		// If message contains youtube video link, supress the embed.
		if (ytdl.validateURL(userMessage)) {
			message.suppressEmbeds(true);
		}

		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			message.reply('Please join a voice channel first!');
			return;
		}

		const botPerms = voiceChannel.permissionsFor(message.client.user);
		if (!botPerms.has('CONNECT') || !botPerms.has('SPEAK')) {
			message.channel.send('I need the permissions to connect and speak in your voice channel!');
			return;
		}

		if (!queue.get(message.guild.id)) {
			queue.set(message.guild.id, new queueConstruct());
		}

		const song = {
			author: message.author,
			videoResult: ytdl.validateURL(userMessage) ? await youtube.getVideo(userMessage)
				: await youtube.searchVideos(userMessage, 1),
			get title() {
				return this.videoResult.title
					|| this.videoResult.values().next().value.title;
			},
			get thumbnail() {
				const thumbnails = this.videoResult.thumbnails || this.videoResult.values().next().value.thumbnails;
				return thumbnails.high.url;
			},
			get url() {
				return this.videoResult.url
					|| this.videoResult.values().next().value.url;
			}
		}

		if (song.videoResult.length === 0) {
			message.channel.send('Unable to find the song.');
			return;
		}

		const serverQueue = queue.get(message.guild.id);

		serverQueue.songs.push(song);

		if (serverQueue.songs.length > 1) {
			message.channel.send(
				new MessageEmbed()
					.setAuthor('Added to queue')
					.setColor('#FF0000')
					.setTitle(song.title)
					.setThumbnail(song.thumbnail)
					.setURL(song.url)
					.setFooter(`By ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
			);
		}

		// Return if bot is already playing.
		if (serverQueue.dispatcher) {
			return;
		}

		voiceChannel.join()
			.then(connection => {
				message.guild.me.voice.setSelfDeaf(true);
				Play(message, connection, serverQueue);
			})
			.catch(error => {
				voiceChannel.leave();
				console.log(error);
			});
	},
	queue
};

function Play(message, voiceConnection, serverQueue) {
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
		Play(message, voiceConnection, serverQueue);
	});
}