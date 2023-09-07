const Discord = require('discord.js');
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

        embed.setTitle('Help - home');
        embed.setDescription('This is the help menu!');
        embed.setColor('#a2db6b');

        const buttons = new Discord.ActionRowBuilder();
        const btn_info = new Discord.ButtonBuilder();

        btn_info.setCustomId('help:info');
        btn_info.setLabel('Bot Info');
        btn_info.setStyle(Discord.ButtonStyle.Primary);

        buttons.addComponents(btn_info);

        msg.channel.send({ embeds: [embed], components: [buttons] });
    },
};
