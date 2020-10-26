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
		let queueList = new String;

		for (let i = 0; i < this.songs.length; i++) {
			const song = this.songs[i];
			queueList += `${i + 1}. ` + `[${song.title}](${song.url})` + '\n';
		}

		return queueList;
	}
}

class Song {
	constructor(video, author) {
		this.author = author;
		this.video = video;
	}

	get title() {
		return this.video.title || this.video.values().next().value.title;
	}
	get thumbnail() {
		const thumbnails = this.video.thumbnails || this.video.values().next().value.thumbnails;
		return thumbnails.high.url;
	}
	get url() {
		return this.video.url || this.video.values().next().value.url;
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
		const isVideoURLValid = ytdl.validateURL(userMessage);
		if (isVideoURLValid) {
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

		const serverQueue = queue.get(message.guild.id);
		const isBotInSameVC = voiceChannel.members.has(message.guild.me.id);

		// Return if bot is already playing in different channel.
		if (message.guild.me.voice.channel && !isBotInSameVC && serverQueue.dispatcher) {
			message.reply('I am already playing in different channel.');
			return;
		}

		const playlist = await youtube.getPlaylist(userMessage).catch(() => { });

		async function getVideos() {
			return playlist ? await playlist.getVideos()
				: isVideoURLValid ? new Array(await youtube.getVideo(userMessage))
					: await youtube.searchVideos(userMessage, 1);
		}

		const videos = await getVideos();
		videos.forEach(video => serverQueue.songs.push(new Song(video, message.author)));

		if (playlist) {
			message.channel.send({
				embed: {
					color: '#FF0000',
					description: `Queued ${serverQueue.songs.length} tracks`,
					footer: { text: `By ${message.author.tag}` }
				}
			});
		} else if (serverQueue.songs.length > 1) {
			const song = new Song(videos.values().next().value, message.author);
			message.channel.send({
				embed: {
					color: '#FF0000',
					author: { name: `Added to queue #${serverQueue.songs.length}` },
					title: song.title,
					thumbnail: song.thumbnail,
					url: song.url,
					footer: { text: `By ${message.author.tag}` }
				}
			});
		}

		// Return if bot is already playing.
		if (isBotInSameVC && serverQueue.dispatcher) {
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
	serverQueue.dispatcher = voiceConnection.play(stream, { bitrate: 165, volume: false });

	serverQueue.dispatcher.on('start', () => {
		message.channel.send(
			new MessageEmbed()
				.setAuthor('Now Playing')
				.setColor('#FF0000')
				.setTitle(song.title)
				.setThumbnail(song.thumbnail)
				.setURL(song.url)
				.setFooter(`Added by ${song.author.tag}`)
		);
	});

	serverQueue.dispatcher.on('finish', async () => {
		// Remove the song from queue once it is finished.
		serverQueue.songs.shift();

		// If the queue is empty, leave the voice channel and delete server queue.
		if (serverQueue.songs.length === 0) {
			message.channel.send(
				new MessageEmbed()
					.setColor('#FF0000')
					.setTitle('Music queue has ended!')
					.setDescription('Type `.s play <song>` to add more.')
			);
			await message.guild.me.voice.channel.leave();
			queue.delete(message.guild.id);
			return;
		}

		// Call the Play function again to play next song.
		Play(message, voiceConnection, serverQueue);
	});
}