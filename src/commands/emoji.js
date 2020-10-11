module.exports = {
    name: 'emoji',
    alias: ['e', 'emote', 'emotelink', 'emojilink', 'elink'],
    permissions: ['ADD_REACTIONS'],
    func: async function (message) {
        const reactionMessage = await message.reply('React to this message to get the emoji link.');

        reactionMessage.awaitReactions(() => { return true }, { maxEmojis: 1, time: 60000 })
            .then(collected => {
                const emoji = collected.first().emoji;
                if (emoji.url) {
                    message.channel.send(`<${emoji.url}>`, { files: [emoji.url] });
                } else {
                    message.channel.send('Unable to find emoji url.');
                }
                reactionMessage.delete();
            })
            .catch(() => {
                message.channel.send({
                    embed: {
                        color: 'RED',
                        description: ':x: Failed to get emoji url!'
                    }
                });
                reactionMessage.delete()
            });
    }
};