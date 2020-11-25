const ytdl = require('ytdl-core');
const yts = require('yt-search');

class Song {
	constructor(video, author) {
		this.author = author;
		this.title = video.title;
		this.thumbnail = video.thumbnail;
		this.url = video.url;
	}
}

const queue = new Map();

function Play(message, voiceConnection, serverQueue) {
	const song = serverQueue.songs[0];

	const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
	serverQueue.dispatcher = voiceConnection.play(stream, { bitrate: 165, volume: false });

	serverQueue.dispatcher.on('start', () => {
		message.channel.send({
			embed: {
				author: { name: 'Now Playing' },
				color: '#FF0000',
				title: song.title,
				thumbnail: { url: song.thumbnail },
				url: song.url,
				footer: { text: `Added by ${song.author.tag}` }
			}
		});
	});

	serverQueue.dispatcher.on('finish', async () => {
		// Remove the song from queue once it is finished.
		serverQueue.songs.shift();

		// If the queue is empty, leave the voice channel and delete server queue.
		if (serverQueue.songs.length === 0) {
			message.channel.send({
				embed: {
					color: '#FF0000',
					title: 'Music queue has ended!',
					description: 'Type `.s play <song>` to add more.'
				}
			});

			// Stop all the reaction collectors.
			const { reactionCollectors } = queue.get(message.guild.id).queueMessage;
			reactionCollectors.forEach(collector => {
				collector.stop();
			});

			message.guild.me.voice.channel.leave();
			queue.delete(message.guild.id);

			return;
		}

		// Call the Play function again to play next song.
		Play(message, voiceConnection, serverQueue);
	});
}

module.exports = {
	name: 'play',
	alias: ['p'],
	guildOnly: true,
	func: async function (message) {
		const userMessage = message.content.split(' ').slice(2).join(' ');
		if (userMessage.length === 0) {
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

		// If server queue doesn't exist, create one.
		if (!queue.get(message.guild.id)) {
			queue.set(message.guild.id, {
				dispatcher: undefined,
				songs: new Array(),
				voiceChannel: undefined,
				queueMessage: {
					reactionCollectors: new Array()
				}
			});
		}

		const serverQueue = queue.get(message.guild.id);
		const isBotInSameVC = voiceChannel.members.has(message.guild.me.id);

		// Return if bot is already playing in different channel.
		if (message.guild.me.voice.channel && !isBotInSameVC && serverQueue.dispatcher) {
			message.reply('I am already playing in different channel.');
			return;
		}

		const songs = await userMessageToYTVideos(userMessage);

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

function getYouTubeVideoID(url) {
	url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	return url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : null;
}

async function userMessageToYTVideos(userMessage) {
	// YouTube playlist
	if (userMessage.includes('https://www.youtube.com/playlist?')) {
		const playlistID = userMessage.match(/[&?]list=([^&]+)/i)[1];
		const playlist = await yts({ listId: playlistID });
		const playlistVideos = playlist.videos
			.filter(video => video.title !== '[Deleted video]')
			.map(playlistVideo => {
				playlistVideo.url = 'https://youtu.be/' + playlistVideo.videoId;
				return playlistVideo;
			});
		return playlistVideos;
	}

	// Youtube video
	const videoID = getYouTubeVideoID(userMessage);
	if (videoID) {
		const video = await yts({ videoId: videoID });
		return [video];
	}

	// YouTube search result
	const searchResult = await yts(userMessage);
	return searchResult.videos.slice(0, 1);
}