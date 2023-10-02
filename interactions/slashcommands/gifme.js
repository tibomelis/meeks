const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');
const { RANDOMGIFKEY } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gifme')
        .setDescription('send a random gif based on a search query')
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('the search query you want to search for.')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(50)
        )
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription(
                    'amount of gifs to randomly choose from (default is 10)'
                )
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const amount = interaction.options.getInteger('amount') ?? 10;

        fetch(
            `https://tenor.googleapis.com/v2/search?q=${query}&key=${RANDOMGIFKEY}&client_key=randomgif&limit=${amount}`
        )
            .then((res) => res.json())
            .then(async (x) => {
                const urls = x.results.map((c) => c.url);
                interaction.reply(
                    urls[Math.floor(Math.random() * urls.length)]
                );
            });
    },
};
