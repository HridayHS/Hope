const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

const { MessageEmbed } = require('discord.js');
const youtube = new YouTube(require('../../../config.json')["youtube-data-api-key"]);

module.exports = {
	name: 'play',
	alias: ['p'],
	guildOnly: true,
	func: async function (message) {
		const userMessage = message.content.slice(8);
		if (userMessage === '') {
			message.channel.send('Please provide a song name or a youtube video link!');
			return;
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

		const song = {
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
			message.channel.send('Unable to find the song.')
			return;
		}

		message.channel.send(
			new MessageEmbed()
				.setAuthor('Playing')
				.setColor('#FF0000')
				.setTitle(song.title)
				.setThumbnail(song.thumbnail)
				.setURL(song.url)
				.setFooter(`By ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true, }))
		);

		voiceChannel.join().then(connection => {
			message.guild.me.voice.setSelfDeaf(true);

			const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
			const dispatcher = connection.play(stream, { bitrate: 192000, volume: 0.85 });

			dispatcher.on('finish', () => voiceChannel.leave());
		});
	}
};