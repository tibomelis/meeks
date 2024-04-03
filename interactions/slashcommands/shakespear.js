const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shakespear')
        .setDescription('Translate a sentance to shakespearian text.')
        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('The text to translate.')
                .setRequired(true)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        interaction.deferReply();
        const text = interaction.options.getString('text');
        const r = await fetch(
            `https://api.funtranslations.com/translate/shakespeare.json?text=${text}`
        );
        const x = await r.json();

        const translated = x?.contents?.translated;

        const embed = new EmbedBuilder()
            .setTitle('Hither is thy translation!')
            .setDescription(`translation: ${translated}`)
            .setColor('#ff0000');

        interaction.editReply({ embeds: [embed] });
    },
};

async function translate(text) {
    return x.contents.translated;
}
