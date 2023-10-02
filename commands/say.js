const Discord = require('discord.js');
const disVoice = require('@discordjs/voice');
const fs = require('fs');
const googleTTS = require('google-tts-api');
const cf = require('./customFunctions');

module.exports = {
    name: 'say',
    short: 's',
    description: 'text to speech',
    category: 'Voice',
    disabled: false,

    /**
     *
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
     */
    async execute(client, msg, args, curPrefix) {
        await cf.mkdir_if_not_exist(`./storage/per_user_config/`);

        if (
            !fs.existsSync(
                `./storage/per_user_config/${msg.member.id}.json`
            )
        ) {
            fs.writeFileSync(
                `./storage/per_user_config/${msg.member.id}.json`,
                JSON.stringify({ accent: 'en' })
            );
        }

        var accent = JSON.parse(
            fs.readFileSync(
                `./storage/per_user_config/${msg.member.id}.json`
            )
        ).accent;
        var send_in_chat = args.includes('--save');
        if (send_in_chat)
            args = args.join(' ').replace('--save', '').split(' ');

        const urls = googleTTS.getAllAudioUrls(args.join(' '), {
            lang: accent,
        });
        if (!msg.member.voice.channelId || send_in_chat) {
            for (var t_url of urls) {
                await send_file(t_url.url);
            }

            async function send_file(url) {
                var audio_file = new Discord.AttachmentBuilder(url);
                var max_length = 20;
                var the_input = args.join('_');
                if (send_in_chat)
                    the_input = the_input.replace('_--save', '');
                var file_name =
                    the_input.length > max_length
                        ? the_input.slice(0, max_length) + '__'
                        : the_input;
                audio_file.setName(`${file_name}.mp3`);
                msg.channel.send({
                    content: "Not in a voice channel, here's the file.",
                    files: [audio_file],
                });
            }
            if (!send_in_chat) {
                return;
            }
        }

        disVoice.joinVoiceChannel({
            channelId: msg.member.voice.channelId,
            guildId: msg.guildId,
            adapterCreator: msg.guild.voiceAdapterCreator,
        });
        var connection = disVoice.getVoiceConnection(msg.guildId);

        var recources = [];

        for (var t_url of urls) {
            recources.push(disVoice.createAudioResource(t_url.url));
        }

        var player = disVoice.createAudioPlayer();

        connection.subscribe(player);

        async function play_next() {
            var recource = recources.shift();
            if (recource == undefined) {
                connection.disconnect();
                return;
            }
            player.play(recource);
        }
        player.once(disVoice.AudioPlayerStatus.Idle, async () => {
            setTimeout(async () => {
                // lil delay before playing next file
                return await play_next();
            }, 500);
        });
        await play_next();

        player.on('error', (err) => {
            msg.channel.send(`Something went wrong!\n||${err.message}||`);
        });
    },
};
