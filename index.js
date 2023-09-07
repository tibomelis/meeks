require('dotenv').config();
const Discord = require('discord.js');
const { TOKEN } = process.env;
const fs = require('fs');

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

var commands = new Discord.Collection();
var slashCommands = new Discord.Collection();
var prefixes;
var prefix;

async function init() {
    if (!fs.existsSync('./storage')) fs.mkdirSync('./storage');

    if (fs.existsSync('./storage/prefixes.json')) {
        prefixes = JSON.parse(
            fs.readFileSync('./storage/prefixes.json').toString()
        );
    } else {
        prefixes = {};
        prefixes.default = ';;';
        fs.writeFileSync(
            './storage/prefixes.json',
            JSON.stringify(prefixes)
        );
    }

    console.log('Loading commands...');

    fs.readdirSync('./commands/')
        .filter((cmd) => cmd != 'index.js' && cmd.endsWith('.js'))
        .forEach((commandName) => {
            var command = require('./commands/' +
                commandName.replace('.js', ''));
            commands[command.name] = command;
            if (command.short != '' && command.short != undefined) {
                commands[command.short] = command;
            }
        });

    Object.keys(commands).forEach((key) => {
        commands.set((key = key), commands[key]);
    });

    const commandFiles = fs
        .readdirSync('./interactions/')
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = './interactions/' + file;
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            slashCommands.set(command.data.name, command);
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

    if (prefixes[msg.guildId] == undefined) {
        prefixes[msg.guildId] = prefixes.default;
        fs.writeFileSync(
            './storage/prefixes.json',
            JSON.stringify(prefixes)
        );
    }

    prefix = prefixes[msg.guildId];

    if (msg.cleanContent.includes('🗿')) msg.react('🗿');
    if (msg.content.includes('<@' + client.user.id + '>')) {
        msg.channel.send("i'm here! (prefix: " + prefix + ')');
    }

    // commands
    if (!msg.cleanContent.startsWith(prefix)) return;

    const args = msg.cleanContent.split(/ +/g);
    const command = args.shift().toLowerCase().slice(prefix.length);

    if (!commands.has(command)) {
        msg.reply("Didn't recognize " + command);
        return;
    }

    try {
        var cmnd = commands.get(command);
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
        cmnd.execute(client, msg, args, prefix);
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
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);

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
});

init();
