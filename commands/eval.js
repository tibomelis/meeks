const Discord = require('discord.js');
const math = require('mathjs');
module.exports = {
    name: 'eval', // required! (usually the same as file name)
    short: 'ev', // if you want it
    description: 'evaluate an expression.', // usefull, not required
    category: 'tools', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        // waaaa
        try {
            msg.reply('```' + math.evaluate(args.join(' ')) + '```');
        } catch (err) {
            msg.reply('```' + err + '``` ');
        }
    },
};
