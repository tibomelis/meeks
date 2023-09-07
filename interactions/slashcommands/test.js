const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('tests this..'),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        interaction.reply({
            content: 'Test Successfull!',
            ephemeral: false,
        });
    },
};
