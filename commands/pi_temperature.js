const Discord = require('discord.js');
const { exec, execSync } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'pi_temperature',
    short: 'pt',
    description: "get the temperature of Tibo's Raspberry Pi",
    category: 'info',
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        const prefixes = JSON.parse(
            fs.readFileSync('./storage/prefixes.json')
        );

        var updateEmbed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Getting temperature');
        var temperatureMsg = await msg.channel.send({
            embeds: [updateEmbed],
        });

        exec('sensors', { windowsHide: true }, (err, syncMsg, stderr) => {
            var changed = true;

            if (err) {
                updateEmbed.setDescription(
                    `Ran into an error when trying to get the temperature.`
                );

                updateEmbed.setTitle('Error getting temp!');
                updateEmbed.setFields([
                    {
                        name: 'Console output:',
                        value: '```' + stderr + '```',
                    },
                ]);
                updateEmbed.setColor('Red');

                temperatureMsg.edit({ embeds: [updateEmbed] });
                return;
            }

            updateEmbed.setTitle('Temperature');

            updateEmbed.setFields([
                {
                    name: 'Console output:',
                    value: '```' + syncMsg + '```',
                },
            ]);

            updateEmbed.setColor('orange');

            temperatureMsg.edit({ embeds: [updateEmbed] });
        });
    },
};
