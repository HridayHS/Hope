const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

const youtube = new YouTube(require('../../../config.json')["youtube-data-api-key"]);

module.exports = {
	name: 'play',
	alias: ['p'],
	guildOnly: true,
	func: async function (message) {
		const songName = message.content.slice(8);
		if (songName === '') {
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
			searchResult: await youtube.searchVideos(songName, 1),
			get url() {
				return this.searchResult.values().next().value.url;
			}
		}

		voiceChannel.join().then(connection => {
			message.guild.me.voice.setSelfDeaf(true);

			const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
			const dispatcher = connection.play(stream, { bitrate: 192000, volume: 0.8 });

			dispatcher.on('finish', () => voiceChannel.leave());
		});
	}
};