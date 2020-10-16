const ytdl = require('ytdl-core');

module.exports = {
    name: 'play',
    alias: ['p'],
    guildOnly: true,
    permissions: { bot: ['CONNECT', 'SPEAK'] },
    func: function (message) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            message.reply('Please join a voice channel first!');
            return;
        }

        voiceChannel.join().then(connection => {
            message.guild.me.voice.setSelfDeaf(true);

            const stream = ytdl('https://youtu.be/24u3NoPvgMw', { filter: 'audioonly', quality: 'highestaudio' });
            const dispatcher = connection.play(stream, { bitrate: 192000, volume: 0.8 });

            dispatcher.on('finish', () => voiceChannel.leave());
        });
    }
};