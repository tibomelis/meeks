const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    /**
     *
     * @param {ButtonInteraction} interaction
     */
    async handle(interaction) {
        interaction.deferUpdate();

        if (interaction.customId.startsWith('help')) {
            const embed = new EmbedBuilder();
            // help buttons

            if (interaction.customId.endsWith('home')) {
                embed
                    .setTitle('Help - Home')
                    .setDescription('This is the help menu!')
                    .setColor('#a2db6b');
            } else if (interaction.customId.endsWith('info')) {
                embed
                    .setTitle('Help - Info')
                    .setDescription('Some information about the bot')
                    .setColor('#6bb9db');
            } else if (interaction.customId.endsWith('commands')) {
                embed
                    .setTitle('Help - Commands')
                    .setDescription('These are all the current commands')
                    .setColor('#dbc86b');

                const commands = fs
                    .readdirSync('./commands/')
                    .filter(
                        (cmd) => cmd.endsWith('.js') && cmd != 'index.js'
                    )
                    .map((cmd) => {
                        const command = require(`./../../commands/${cmd}`);
                        var name = command.name;
                        if (command.short != '')
                            name += ` (${command.short})`;
                        return {
                            name,
                            value: command.description,
                        };
                    });

                embed.addFields(commands);
            }

            interaction.message.edit({ embeds: [embed] });
        }
    },
};
