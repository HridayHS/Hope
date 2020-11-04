const { MessageEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');

const ytdl = require('ytdl-core');
const youtube = new YouTube(require('../../config.json')["youtube-data-api-key"]);

const queue = new Map();

class Song {
	constructor(video, author) {
		this.author = author;
		this.video = video;
		this.title = video.title;
		this.thumbnail = video.thumbnails.high.url;
		this.url = video.shortURL;
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
			queue.set(message.guild.id, { dispatcher: undefined, songs: new Array(), voiceChannel: undefined });
		}

		const serverQueue = queue.get(message.guild.id);
		const isBotInSameVC = voiceChannel.members.has(message.guild.me.id);

		// Return if bot is already playing in different channel.
		if (message.guild.me.voice.channel && !isBotInSameVC && serverQueue.dispatcher) {
			message.reply('I am already playing in different channel.');
			return;
		}

		const songs = await resolveUserMessage(userMessage);

		if (songs.length === 0) {
			message.channel.send('Unable to find the song.');
			return;
		}

		songs.forEach(video => serverQueue.songs.push(new Song(video, message.author)));

		if (songs.length > 1) {
			message.channel.send({
				embed: {
					color: '#FF0000',
					description: `Queued ${songs.length} tracks`,
					footer: { text: `By ${message.author.tag}` }
				}
			});
		} else if (serverQueue.songs.length > 1) {
			const song = new Song(songs.values().next().value, message.author);
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
				serverQueue.voiceChannel = voiceChannel;
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

async function resolveUserMessage(userMessage) {
	const playlist = await youtube.getPlaylist(userMessage).catch(() => { });

	return playlist ? await playlist.getVideos()
		: ytdl.validateURL(userMessage) ? new Array(await youtube.getVideo(userMessage)).catch(() => { })
			: await youtube.searchVideos(userMessage, 1);
}

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
			serverQueue.collector.stop('QueueEnded');
			queue.delete(message.guild.id);
			return;
		}

		// Call the Play function again to play next song.
		Play(message, voiceConnection, serverQueue);
	});
}