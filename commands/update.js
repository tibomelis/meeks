const Discord = require('discord.js');
const { exec, execSync } = require('child_process');
const fs = require('fs');

module.exports = {
    name: 'update',
    short: '',
    description: 'update the bot',
    category: 'Settings',
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
            fs.readFileSync('./config/prefixes.json')
        );

        var updateEmbed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Updating');
        var updateMsg = await msg.channel.send({
            embeds: [updateEmbed],
        });

        exec(
            'git pull && npm i',
            { windowsHide: true },
            (err, syncMsg, stderr) => {
                var changed = true;

                if (err) {
                    updateEmbed.setDescription(
                        `Ran into an error when trying to update.`
                    );

                    updateEmbed.setTitle('Error updating!');
                    updateEmbed.setFields([
                        {
                            name: 'Console output:',
                            value: '```' + stderr + '```',
                        },
                    ]);
                    updateEmbed.setColor('Red');

                    updateMsg.edit({ embeds: [updateEmbed] });
                    return;
                }

                if (syncMsg.includes('Already up to date.')) {
                    updateEmbed.setDescription(
                        `No changes to be made. But you can still restart with \`${
                            prefixes[msg.guildId]
                        }restart\` ||it's fun||`
                    );
                    changed = false;
                } else {
                    updateEmbed.setDescription(
                        `Use \`${
                            prefixes[msg.guildId]
                        }restart\` to apply changes`
                    );
                }
                updateEmbed.setTitle('Updated!');
                if (changed) {
                    const commitMessage = execSync(
                        'git log -1 --pretty=format:%B'
                    ).toString();
                    const commitAuthor = execSync(
                        'git log -1 --pretty=format:%an'
                    ).toString();
                    updateEmbed.setFields([
                        {
                            name: 'Console output:',
                            value: '```' + syncMsg + '```',
                        },
                        {
                            name: 'Last update message',
                            value:
                                '```' +
                                commitMessage +
                                '\n - ' +
                                commitAuthor +
                                '```',
                        },
                    ]);
                } else {
                    updateEmbed.setFields([
                        {
                            name: 'Console output:',
                            value: '```' + syncMsg + '```',
                        },
                    ]);
                }
                updateEmbed.setColor('Green');

                updateMsg.edit({ embeds: [updateEmbed] });
            }
        );
    },
};
