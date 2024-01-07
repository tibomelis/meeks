const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    AttachmentBuilder,
} = require('discord.js');

const { loadImage, createCanvas } = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsplash')
        .setDescription('Get a random unsplash image.')
        .addStringOption((option) =>
            option
                .setName('searchterm')
                .setDescription(
                    "an optional searchterm like 'cow' or 'nature'"
                )
                .setRequired(false)
        )
        .addNumberOption((option) =>
            option
                .setName('imagewidth')
                .setDescription('The width of an image (default 2500)')
                .setRequired(false)
        )
        .addNumberOption((option) =>
            option
                .setName('imageheight')
                .setDescription('The height of an image (default 2000)')
                .setRequired(false)
        ),

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply();

        const searchterm =
            interaction.options.getString('searchterm') ?? '';
        const width = interaction.options.getNumber('imagewidth') ?? 2500;
        const height =
            interaction.options.getNumber('imageheight') ?? 2000;

        var url = `https://source.unsplash.com/random/${width}x${height}/`;
        if (searchterm != '') url = `${url}?${searchterm}`;
        const response = await fetch(url);
        const resClone = response.clone();

        const blob = await resClone.blob();

        if (!blob.type.startsWith('image/'))
            return interaction.editReply('Sorry, something went wrong!');

        const arraybuffer = await response.arrayBuffer();

        const embed = new EmbedBuilder()
            .setTitle('Unsplash image')
            .setDescription(
                `Requested by ${
                    interaction.member.nickname ??
                    interaction.member.displayName
                }`
            )
            .setColor('LightGrey');
        const name = `image.${blob.type.replace('image/', '')}`;
        const file = new AttachmentBuilder(Buffer.from(arraybuffer), name);

        embed.setImage(`attachment://${name}`);
        interaction.channel.send(`the name is ${name}`);
        
        interaction.editReply({
            embeds: [embed],
            files: [file],
            ephemeral: false,
        });
    },
};
