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

        if (checkForPm2()) {
            execSync('pm2 restart Tibo_Bot', {
                windowsHide: true,
            });
        } else {
            exec('node index.js', {
                windowsHide: true,
            });
            setTimeout(() => {
                process.exit();
            }, 100);
        }

        function checkForPm2() {
            const result = execSync('pm2 -h').toString();
            return result.includes('Usage: pm2 [cmd] app');
        }
    },
};
