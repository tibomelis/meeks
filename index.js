require('dotenv').config();
const Discord = require('discord.js');
const { TOKEN, RANDOMGIFKEY } = process.env;
const fs = require('fs');

const buttonHandler = require('./interactions/buttons/buttonHandler');
const client = new Discord.Client({
    intents: new Discord.IntentsBitField().add([
        'DirectMessages',
        'DirectMessageTyping',
        'DirectMessageReactions',
        'Guilds',
        'GuildMessages',
        'GuildMembers',
        'GuildVoiceStates',
        'GuildMessageReactions',
        'MessageContent',
    ]),
});

var col_chatCommands = new Discord.Collection();
var col_slashInteractions = new Discord.Collection();
var dict_prefixes;
var str_prefix;

async function init() {
    // if there is no 'storage' folder, create folder.
    if (!fs.existsSync('./storage')) fs.mkdirSync('./storage');

    // get server prefixes (for chat commands)
    if (fs.existsSync('./storage/prefixes.json')) {
        dict_prefixes = JSON.parse(
            fs.readFileSync('./storage/prefixes.json').toString()
        );
    } else {
        dict_prefixes = {};
        dict_prefixes.default = ';;';
        fs.writeFileSync(
            './storage/prefixes.json',
            JSON.stringify(dict_prefixes)
        );
    }

    // load chat commands
    fs.readdirSync('./commands/')
        .filter((cmd) => cmd != 'index.js' && cmd.endsWith('.js'))
        .forEach((commandName) => {
            var command = require('./commands/' +
                commandName.replace('.js', ''));
            col_chatCommands[command.name] = command;
            if (command.short != '' && command.short != undefined) {
                col_chatCommands[command.short] = command;
            }
        });

    Object.keys(col_chatCommands).forEach((key) => {
        col_chatCommands.set((key = key), col_chatCommands[key]);
    });

    // load slash commands

    const commandFiles = fs
        .readdirSync('./interactions/slashcommands/')
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = './interactions/slashcommands/' + file;
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            col_slashInteractions.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }

    console.log('Connecting...');
    client.login(TOKEN);
}
client.on('ready', async () => {
    client.application.commands.cache.forEach((command) => {
        command.delete();
    });

    console.log(
        `Logged in as: ${client.user.tag} (id: ${client.user.id})`
    );

    if (fs.existsSync('./storage/restart_info.json')) {
        var restart_info = JSON.parse(
            fs.readFileSync('./storage/restart_info.json').toString()
        );
        if (
            restart_info.channel_id != undefined &&
            restart_info.msg_id != undefined
        ) {
            var restart_msg_channel = await client.channels.fetch(
                restart_info.channel_id
            );
            var restart_msg = await restart_msg_channel.messages.fetch(
                restart_info.msg_id
            );
            restart_msg.edit('Restarted!');
            fs.writeFileSync('./storage/restart_info.json', '{}');
        }
    }

    client.user.setPresence({
        status: 'idle',
        afk: true,
        activities: [
            {
                name: 'Making excellent everyday kitchen supplies!',
                url: 'https://imgur.com/Z5SXLxx',
            },
        ],
    });

    console.log('bot ready!');
});

client.on('messageCreate', async (msg) => {
    if (msg.author.id == client.user.id) return;

    if (msg.cleanContent.includes('duolingo'))
        fetch(
            `https://tenor.googleapis.com/v2/search?q=duolingo&key=${RANDOMGIFKEY}&client_key=randomgif&limit=50`,
            { method: 'GET' }
        )
            .then((res) => res.json())
            .then(async (x) => {
                console.log(x);
                // const urls = x.results.map((c) => c.url);
                // msg.reply(urls[Math.floor(Math.random() * urls.length)]);
            });

    if (dict_prefixes[msg.guildId] == undefined) {
        dict_prefixes[msg.guildId] = dict_prefixes.default;
        fs.writeFileSync(
            './storage/prefixes.json',
            JSON.stringify(dict_prefixes)
        );
    }

    str_prefix = dict_prefixes[msg.guildId];

    if (msg.cleanContent.includes('🗿')) msg.react('🗿');
    if (msg.content.includes('<@' + client.user.id + '>')) {
        msg.channel.send("i'm here! (prefix: " + str_prefix + ')');
    }

    // commands
    if (!msg.cleanContent.startsWith(str_prefix)) return;

    const args = msg.cleanContent.split(/ +/g);
    const command = args.shift().toLowerCase().slice(str_prefix.length);

    if (!col_chatCommands.has(command)) {
        msg.reply("Didn't recognize " + command);
        return;
    }

    try {
        var cmnd = col_chatCommands.get(command);
        if (cmnd.disabled) {
            if (
                cmnd.allowedGuilds == undefined ||
                cmnd.allowedGuilds[0] == undefined
            ) {
                return require('./commands/customFunctions/command_disabled').run(
                    msg
                );
            } else if (!cmnd.allowedGuilds.includes(msg.channel.guildId)) {
                return require('./commands/customFunctions/disabled_in_guild').run(
                    msg
                );
            }
        }
        cmnd.execute(client, msg, args, str_prefix);
    } catch (err) {
        console.log(
            'Something went wrong while executing a command.',
            err
        );
        await msg.channel.send(
            `Something went wrong while executing this command. ||${err}||`
        );
    }
});

client.on('guildCreate', async (guild) => {
    var user = await client.users.fetch(ids.HEYITSTIBO);
    user.send(`Added to server \`${guild.name}\``);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        try {
            await buttonHandler.handle(interaction, col_chatCommands);
        } catch (err) {
            console.log(err);
            interaction.channel.send(
                'There was an error while handling this button!'
            );
        }
    } else if (interaction.isChatInputCommand()) {
        const command = col_slashInteractions.get(interaction.commandName);

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content:
                        'There was an error while executing this command!',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content:
                        'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        }
    }
});

init();
