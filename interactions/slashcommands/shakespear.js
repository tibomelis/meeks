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
            .addFields(
                { name: 'From', value: `${text}` },
                { name: 'To', value: `${translated}` }
            )
            .setColor('#5D92BA');

        interaction.editReply({ embeds: [embed] });
    },
};

async function translate(text) {
    return x.contents.translated;
}
