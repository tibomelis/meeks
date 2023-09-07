const Discord = require('discord.js');
module.exports = {
    name: 'test', // required! (usually the same as file name)
    short: '', // if you want it
    description: 'tests this..', // usefull, not required
    category: 'debug', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        msg.reply('Test Successfull!');
    },
};
