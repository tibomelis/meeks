const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    AttachmentBuilder,
} = require('discord.js');

const { loadImage, createCanvas } = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('create a meme fom an image')
        .addAttachmentOption((option) =>
            option
                .setName('image')
                .setRequired(true)
                .setDescription('the image to meme')
        )
        .addStringOption((option) =>
            option
                .setName('toptext')
                .setDescription('the text at the top')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('bottomtext')
                .setDescription('the text at the bottom')
                .setRequired(false)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply();

        const image = interaction.options.getAttachment('image');
        const toptext = interaction.options.getString('toptext');
        const bottomtext = interaction.options.getString('bottomtext');

        const embed = new EmbedBuilder()
            .setTitle(
                `Created by ${
                    interaction.member.nickname ??
                    interaction.member.displayName
                }`
            )
            .setDescription('TEST')
            .setColor('Green');

        if (!image.contentType.startsWith('image/')) {
            embed
                .setDescription('Invalid Attachement Provided!')
                .setColor('Red');

            interaction.editReply({
                embeds: [embed],
                ephemeral: false,
            });
            return;
        }

        if (!toptext && !bottomtext) {
            embed
                .setDescription(
                    "You didnt add any text.. but here's the image anyway"
                )
                .setImage(`attachment://${image.name}`);

            interaction.editReply({
                embeds: [embed],
                files: [image],
                ephemeral: false,
            });

            return;
        }

        const img = await loadImage(image.url);

        const size = 2000;
        var aspect = 1;

        const canvas = createCanvas();
        const ctx = canvas.getContext('2d');

        if (img.width > img.height) {
            aspect = img.height / img.width;

            canvas.width = size;
            canvas.height = size * aspect;
        } else {
            aspect = img.width / img.height;

            canvas.width = size * aspect;
            canvas.height = size;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '100px Arial';

        const maxW = canvas.width * 0.7;
        if (toptext) drawText(ctx, toptext, maxW, 0, 0);
        if (bottomtext)
            drawText(ctx, bottomtext, maxW, 0, canvas.height, true);

        /*
        if (toptext) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, 200);
            ctx.fillStyle = '#fff';
            ctx.fillText(toptext, 0, 0);
        }
        if (bottomtext) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
            ctx.fillStyle = '#fff';
            ctx.fillText(bottomtext, 0, canvas.height - 200);
        }
        */

        const file = new AttachmentBuilder()
            .setFile(canvas.toBuffer())
            .setName('img.png');

        embed.setImage(`attachment://${file.name}`);

        interaction.editReply({
            embeds: [embed],
            files: [file],
            ephemeral: false,
        });
    },
};

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxwidth
 * @param {number} x
 * @param {number} y
 * @param {boolean} isAtBottom
 */
function drawText(ctx, text, maxwidth, x, y, isAtBottom = false) {
    const txtSize = ctx.measureText(text);
    if (txtSize.width < maxwidth) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y - (isAtBottom ? 200 : 0), ctx.canvas.width, 200);

        ctx.fillStyle = '#fff';
        ctx.fillText(
            text,
            x + ctx.canvas.width / 2,
            y - (isAtBottom ? 200 : 0) + 100
        );
        return;
    } else {
        const words = text.split(' ');
        const lines = [];
        var sentence = '';

        for (let i = 0; i < words.length; i++) {
            if (
                words[i + 1] &&
                ctx.measureText(`${sentence} ${words[i + 1]}`).width >=
                    maxwidth
            ) {
                lines.push(sentence);
                sentence = '';
            }
            sentence = `${sentence} ${words[i]}`;
        }
        // sentence + `${sentence} ${words}`;
        lines.push(sentence);

        ctx.fillStyle = '#000';
        var offset = 200 * ((lines.length + 1) / 2);

        ctx.fillRect(
            x,
            y - (isAtBottom ? offset : 0),
            ctx.canvas.width,
            offset
        );

        lines.forEach((line, lineNr) => {
            offset = 200 * ((lineNr + 1) / 2);

            ctx.fillStyle = '#fff';
            ctx.fillText(
                line,
                x + ctx.canvas.width / 2,
                y -
                    (isAtBottom ? 200 * ((lines.length + 1) / 2) : 0) +
                    offset
            );
        });
    }
}
