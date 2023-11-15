const Discord = require('discord.js');
const { exec, execSync } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'execute',
    short: 'exec',
    description: 'execute a terminal command (only for tibo)',
    category: 'dev',
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        var embed = new Discord.EmbedBuilder()
            .setColor('#ffd000')
            .setTitle('Executing command');

        var commandMsg = await msg.channel.send({
            embeds: [embed],
        });

        if (msg.author.id != '457897694426300418') {
            embed.setTitle('No permission!').setColor('Red');
            commandMsg.edit(embed);
            return;
        }

        exec(
            args.join(' '),
            { windowsHide: true },
            (err, syncMsg, stderr) => {
                var changed = true;

                if (err) {
                    embed.setDescription(
                        `Ran into an error when trying to execute the command.`
                    );

                    embed.setTitle('Error executing command!');
                    embed.setFields([
                        {
                            name: 'Console output:',
                            value: '```' + stderr + '```',
                        },
                    ]);
                    embed.setColor('Red');

                    commandMsg.edit({ embeds: [embed] });
                    return;
                }

                embed.setTitle('Output');

                embed.setFields([
                    {
                        name: 'Console output:',
                        value: '```' + syncMsg.toString() + '```',
                    },
                ]);

                embed.setColor('#ff9d00');

                commandMsg.edit({ embeds: [embed] });
            }
        );
    },
};
