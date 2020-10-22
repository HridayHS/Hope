const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

const { MessageEmbed } = require('discord.js');
const youtube = new YouTube(require('../../config.json')["youtube-data-api-key"]);

const { Play, queue, queueConstruct } = require('./utils');

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

		voiceChannel.join().then(connection => {
			message.guild.me.voice.setSelfDeaf(true);
			Play(message, connection, ytdl, serverQueue);
		});
	}
};