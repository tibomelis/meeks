const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'help', // required! (usually the same as file name)
    short: '', // if you want it
    description: 'Show help menu', // usefull, not required
    category: 'general', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        const embed = new Discord.EmbedBuilder();

        embed
            .setTitle('Help - Home')
            .setDescription('This is the help menu!')
            .setColor('#a2db6b');

        const buttons = new Discord.ActionRowBuilder();

        fs.readdirSync('./interactions/buttons/')
            .filter(
                (btn) =>
                    btn.endsWith('js') &&
                    btn.startsWith('help') &&
                    btn != 'help_home.js'
            )
            .forEach((btn) =>
                buttons.addComponents(
                    require(`../interactions/buttons/${btn}`)
                )
            );

        msg.channel.send({ embeds: [embed], components: [buttons] });
    },
};
