const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ComponentType,
    ButtonStyle,
    ActionRowBuilder,
    SlashCommandStringOption,
    ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} = require('discord.js');
const disVoice = require('@discordjs/voice');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playsound')
        .setDescription('play an attached sound in vc')
        .addAttachmentOption((option) =>
            option
                .setName('upload_audio')
                .setDescription('the audio file you want to play')
                .setRequired(false)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        // making sure the required folders exist
        if (!fs.existsSync('./storage')) fs.mkdirSync('./storage');
        if (!fs.existsSync('./storage/audio'))
            fs.mkdirSync('./storage/audio');

        // loading embed. purely cosmetic
        const embed = new EmbedBuilder()
            .setTitle('Loading...')
            .setColor('Yellow');

        const msg = await interaction.reply({ embeds: [embed] });

        // get the uploaded file
        const uploaded_file =
            interaction.options.getAttachment('upload_audio');

        /** @type {string} */
        var fileurl;
        /** @type {string} */
        var filename;

        if (!uploaded_file) {
            if (fs.readdirSync('./storage/audio/').length == 0) {
                embed.setTitle('No saved sounds.').setColor('Purple');
                msg.edit({ embeds: [embed] });
                return;
            }
            embed
                .setTitle('Please select an audio option below.')
                .setColor('Yellow');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('audio')
                    .setOptions(
                        ...fs.readdirSync('./storage/audio/').map((x) => {
                            const name = x.replace(/\..*/g, '');
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(name)
                                .setValue(x);
                        })
                    )
            );

            msg.edit({ embeds: [embed], components: [row] });

            const res = await msg
                .awaitMessageComponent({
                    filter: (i) => i.user.id == interaction.user.id,
                    componentType: ComponentType.StringSelect,
                    time: 10000,
                })
                .catch(() => {
                    embed
                        .setTitle(
                            'No response in time. Try again with uploading an audio file.'
                        )
                        .setColor('Red');
                    msg.edit({ embeds: [embed] });
                });

            filename = res.values[0];
            fileurl = './storage/audio/' + filename;
        } else {
            // check if the file is an audio file
            if (!uploaded_file.contentType.startsWith('audio/')) {
                embed.setTitle('Not an audio file!').setColor('Red');
                msg.edit({ embeds: [embed] });
                return;
            }

            fileurl = uploaded_file.url;
            filename = uploaded_file.name;
        }

        // join the channel the user is in.
        disVoice.joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        // get the connection
        var connection = disVoice.getVoiceConnection(interaction.guildId);

        // create a recource from the file
        const recource = disVoice.createAudioResource(fileurl);

        // create an audio player and play the sound in the channel via the connection
        var player = disVoice.createAudioPlayer();

        connection.subscribe(player);
        player.play(recource);

        var btn = new ButtonBuilder();
        if (!uploaded_file) {
            btn.setCustomId('deletesound')
                .setLabel('Delete Sound')
                .setEmoji('🗑️')
                .setStyle(ButtonStyle.Danger);
        } else {
            // build save button
            btn.setCustomId('savesound')
                .setLabel('Save Sound')
                .setEmoji('🗃️')
                .setStyle(ButtonStyle.Success);

            if (uploaded_file.size > 1024000) {
                btn.setDisabled(true).setLabel(
                    'Save Sound (Disabled because file size is equal or larger than 1mb'
                );
            }
        }
        // change embed
        embed.setTitle('Playing `' + filename + '`!').setColor('Green');

        msg.edit({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(btn)],
        });

        // when the player is idle, check if it started playing something else after a second
        player.once(disVoice.AudioPlayerStatus.Idle, async () => {
            embed.setTitle('Done playing.').setColor('Green');
            msg.edit({ embeds: [embed] });
            setTimeout(() => {
                if (player.state != disVoice.AudioPlayerStatus.Playing)
                    connection.disconnect();
            }, 1000);
        });

        // error handling
        player.on('error', (err) => {
            msg.channel.send(`Something went wrong!\n||${err.message}||`);
        });

        if (btn.data.disabled) return;

        try {
            const btn_interaction = await msg.awaitMessageComponent({
                filter: (i) => i.user.id == interaction.user.id,
                componentType: ComponentType.Button,
                time: 15000,
            });

            await msg.edit({ components: [] });

            if (btn_interaction.customId == 'savesound') {
                const saving_embed = new EmbedBuilder()
                    .setTitle('Saving `' + filename + '`...')
                    .setColor('Yellow');

                const saving_msg = await btn_interaction.channel.send({
                    embeds: [saving_embed],
                });
                const res = await fetch(fileurl);
                const arrBuff = await res.arrayBuffer();

                fs.writeFileSync(
                    './storage/audio/' + filename,
                    Buffer.from(arrBuff)
                );

                saving_embed.setTitle('Saved!').setColor('Green');

                await saving_msg.edit({ embed: [saving_embed] });

                await sleep(5);

                if (saving_msg.deletable) saving_msg.delete();
            } else {
                const deleting_embed = new EmbedBuilder()
                    .setTitle('Deleting `' + filename + '`...')
                    .setColor('Yellow');

                const del_msg = await btn_interaction.channel.send({
                    embeds: [deleting_embed],
                });

                fs.rmSync(fileurl);

                deleting_embed.setTitle('Deleted!').setColor('Green');

                await del_msg.edit({ embed: [deleting_embed] });

                await sleep(5);

                if (del_msg.deletable) del_msg.delete();
            }
        } catch (err) {
            msg.edit({ embeds: [embed], components: [] });
        }
    },
};

async function sleep(t) {
    return new Promise((res) => setTimeout(() => res(), t * 1000));
}
