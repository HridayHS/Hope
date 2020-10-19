const { MessageEmbed } = require('discord.js');
const { botVersion } = require('../../../utils');

module.exports = {
    name: 'version',
    alias: ['v'],
    func: async function (message) {
        message.channel.send(
            new MessageEmbed()
                .setColor('GREEN')
                .setDescription(await botVersion())
        );
    }
};