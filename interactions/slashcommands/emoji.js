const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} = require('discord.js');
const fs = require('fs');

const tiboguild = '555084915704725505';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('testing')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('a')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addAttachmentOption((option) =>
            option.setName('image').setDescription('a').setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName('delete')
                .setDescription(
                    'Set this to true if you want to delete the emoji'
                )
                .setRequired(false)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply();

        const image = interaction.options.getAttachment('image');
        const name = interaction.options.getString('name');
        if (!fs.existsSync('storage/emojis/emojis.json'))
            fs.writeFileSync('storage/emojis/emojis.json', '[]');

        const emojis = JSON.parse(
            fs.readFileSync('storage/emojis/emojis.json').toString()
        );

        if (image) {
            if (emojis.find((e) => e.name == name)) {
                interaction.editReply(
                    `This name already exists \`(${name})\``
                );

                return;
            }

            emojis.push({ name, image: image.attachment });

            interaction.editReply('Added emoji!');

            fs.writeFileSync(
                'storage/emojis/emojis.json',
                JSON.stringify(emojis)
            );
            return;
        }

        const emoji = emojis.find((e) => e.name == name);
        if (emoji) {
            if (interaction.options.getBoolean('delete')) {
                emojis.splice(emojis.indexOf(emoji), 1);
                fs.writeFileSync(
                    'storage/emojis/emojis.json',
                    JSON.stringify(emojis)
                );
                interaction.editReply(`Deleted Emoji \`(${emoji.name}\`)`);
                return;
            }
            const guild = await interaction.client.guilds.fetch(tiboguild);

            const e = await guild.emojis.create({
                attachment: emoji.image,
                name: emoji.name.replace(/[^\w]/g, '_'),
                reason: 'Create emoji with command',
            });

            await interaction.editReply(`<:${e.name}:${e.id}>`);

            await e.delete();

            return;
        }

        interaction.editReply('This emoji does not exist.');
    },
};
