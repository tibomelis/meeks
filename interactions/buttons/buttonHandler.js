const {
    ButtonInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    Collection,
} = require('discord.js');
const fs = require('fs');
module.exports = {
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {Collection<any, any>} chatCommands
     */
    async handle(interaction, chatCommands) {
        interaction.deferUpdate();

        if (interaction.customId.startsWith('commandcategory')) {
            // categories and their commands
        }

        if (interaction.customId.startsWith('help')) {
            const embed = new EmbedBuilder();
            // help buttons

            const buttons = new ActionRowBuilder();

            fs.readdirSync('./interactions/buttons/')
                .filter(
                    (btn) => btn.endsWith('js') && btn.startsWith('help')
                )
                .forEach((btn) =>
                    buttons.addComponents(require(`./${btn}`))
                );

            const commands = fs
                .readdirSync('./commands/')
                .filter((cmd) => cmd.endsWith('.js') && cmd != 'index.js')
                .map((cmd) => {
                    const command = require(`./../../commands/${cmd}`);
                    var name = command.name;
                    if (command.short != '') name += ` (${command.short})`;
                    return {
                        name,
                        value: command.description,
                    };
                });

            if (interaction.customId.endsWith('home')) {
                embed
                    .setTitle('Help - Home')
                    .setDescription('This is the help menu!')
                    .setColor('#a2db6b');
            } else if (interaction.customId.endsWith('info')) {
                embed
                    .setTitle('Help - Info')
                    .setDescription('Some information about the bot')
                    .setColor('#6bb9db')
                    .addFields(
                        {
                            name: 'Creator',
                            value: 'Tibo Melis. (tiibo)',
                        },
                        {
                            name: 'Amount of commands',
                            value: `Currently at ${commands.length}`,
                        }
                    );
            } else if (interaction.customId.endsWith('commands')) {
                embed
                    .setTitle('Help - Commands')
                    .setDescription('These are all the current commands')
                    .setColor('#dbc86b');

                buttons.setComponents(require(`./help_home`));

                const categories = [];
                chatCommands.forEach((c) => {
                    if (!categories.includes(c.category)) {
                        categories.push(c.category);
                    }
                });

                embed.addFields(commands);
                embed.addFields({
                    name: 'Categories',
                    value: categories.join('\n'),
                });
            }

            interaction.message.edit({
                embeds: [embed],
                components: [buttons],
            });
        }
    },
};
