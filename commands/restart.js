const Discord = require('discord.js');
const fs = require('fs');
const { exec, execSync } = require('child_process');

module.exports = {
    name: 'restart',
    short: '',
    description: 'restart the bot',
    category: 'DangerZone',
    disabled: false,

    /**
     *
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
     */
    async execute(client, msg, args, curPrefix) {
        let bot_msg = await msg.reply('Restarting...');
        fs.writeFileSync(
            './storage/restart_info.json',
            JSON.stringify({
                msg_id: bot_msg.id,
                channel_id: bot_msg.channel.id,
            })
        );
        execSync('pm2 restart meeks', {
            windowsHide: true,
        });
    },
};
