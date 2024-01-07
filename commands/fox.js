//https://randomfox.ca/images/0.jpg

const { loadImage } = require('@napi-rs/canvas');
const Discord = require('discord.js');
module.exports = {
    name: 'fox', // required! (usually the same as file name)
    short: '', // if you want it
    description: 'An image of a Fox!', // usefull, not required
    category: 'cute', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('Fox')
            .setDescription(
                `A Fox has been requested by ${
                    msg.member.nickname ?? msg.member.displayName
                } (aka ${msg.member.user.username})`
            )
            .setColor('Orange')
            .setImage(
                `https://randomfox.ca/images/${
                    Math.floor(Math.random() * 123) + 1
                }.jpg`
            );

        msg.channel.send({ embeds: [embed] });
    },
};
