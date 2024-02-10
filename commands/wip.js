const { time } = require('console');
const Discord = require('discord.js');
const fs = require('fs');

const gamesFilePath = './storage/shutthebox.json';
const { rowYN } = require('./../interactions/buttons/rowYN');
const embed = new Discord.EmbedBuilder().setColor('#ffffff');
/** @type {Discord.Message} */
var message;

const GAMESTAGES = {
    Idle: 0,
    Dicethrow: 1,
    NumberSelect: 2,
};

const command = {
    name: 'wip', // required! (usually the same as file name)
    short: '', // if you want it
    description: 'work in progress', // usefull, not required
    category: '', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        message = msg;
        if (!fs.existsSync('./storage')) fs.mkdirSync('./storage');

        const games = fs.existsSync(gamesFilePath)
            ? JSON.parse(fs.readFileSync(gamesFilePath).toString())
            : {};

        if (games[msg.author.id]?.activegame) {
            embed
                .setTitle('Active Game.')
                .setDescription(
                    'You have a active game. Would you like to stop that game?'
                );
            const response = await msg.channel.send({
                embeds: [embed],
                components: [rowYN],
            });

            const filter = (i) => i.user.id === msg.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter,
                    time: 60000,
                });

                if (confirmation.customId == 'y') {
                    games[msg.author.id].activegame = false;
                    games[msg.author.id].gamestate = {};
                    embed
                        .setTitle('Active Game deleted.')
                        .setDescription('')
                        .setColor('Green');
                } else if (confirmation.customId == 'n') {
                    embed
                        .setTitle('Active Game *not* deleted.')
                        .setDescription('')
                        .setColor('#cccccc');
                }
                msg.edit({ embeds: [embed] });
            } catch (e) {
                embed
                    .setDescription('No reaction was given in one minute.')
                    .setColor('#cccccc');
                response.edit({ embeds: [embed] });
            }

            return;
        }
        mainGame();
    },
};
async function waitFor(seconds) {
    return new Promise((res) => setTimeout(() => res, seconds * 1000));
}

async function mainGame() {
    const msg = message;

    const gameData = {};

    gameData.activegame = false;
    gameData.wins = 0;
    const gamestate = {};
    gameData.gamestate = gamestate;

    gamestate.turn = 0;
    gamestate.activeNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    gamestate.inactiveNumbers = [];
    gamestate.selectedNumbers = [];
    gamestate.requiredNum = 0;
    gamestate.selectedNum = 0;
    gamestate.state = GAMESTAGES.Idle;

    gameData.activegame = true;

    /** @type {Discord.Message} */
    var gameMsg;

    const numberbuttons = [
        numberbtn(1),
        numberbtn(2),
        numberbtn(3),
        numberbtn(4),
        numberbtn(5),
        numberbtn(6),
        numberbtn(7),
        numberbtn(8),
        numberbtn(9),
        numberbtn(10),
    ];

    while (gameData.activegame) {
        switch (gamestate.state) {
            case GAMESTAGES.Idle:
                embed
                    .setTitle('New Game')
                    .setDescription('Start new game?');

                gameMsg = await msg.channel.send({
                    embeds: [embed],
                    components: [rowYN],
                });

                const filter = (i) => i.user.id === message.author.id;

                try {
                    const confirmation =
                        await gameMsg.awaitMessageComponent({
                            filter,
                            time: 60000,
                        });

                    if (confirmation.customId == 'y') {
                        gamestate.state = GAMESTAGES.Dicethrow;

                        await waitFor(1);
                    } else if (confirmation.customId == 'n') {
                        embed
                            .setTitle('OK!')
                            .setDescription(
                                `Use ${command.name} ${
                                    command.short != ''
                                        ? '(or ' + command.short + ')'
                                        : ''
                                } to start a new game`
                            )
                            .setFooter({
                                text: 'Message will be deleted in 1 minute',
                            });
                        gameMsg.edit({ embeds: [embed], components: [] });
                        await waitFor(60);
                        if (gameMsg.deletable) gameMsg.delete();
                        gameData.activegame = false;
                        saveGame(gameData);
                    }
                } catch (e) {
                    embed
                        .setTitle('Nothing Selected.')
                        .setDescription(' ')
                        .setFooter({
                            text: 'Message will be deleted in 1 minute',
                        });
                    gameMsg.edit({ embeds: [embed], components: [] });
                    await waitFor(60);
                    if (gameMsg.deletable) gameMsg.delete();
                    gameData.activegame = false;
                    saveGame(gameData);
                }

            case GAMESTAGES.Dicethrow:
                gamestate.turn++;

                const die1 = Math.floor(Math.random() * 12);
                const die2 = Math.floor(Math.random() * 12);

                gamestate.requiredNum = die1 + die2;

                embed
                    .setTitle('Active game.')
                    .setDescription(
                        `Numbers thrown are ${die1} and ${die2}`
                    )
                    .setColor('Green');

                gamestate.state = GAMESTAGES.NumberSelect;

            case GAMESTAGES.NumberSelect:
                numberbuttons.forEach((btn) =>
                    btn.setStyle(Discord.ButtonStyle.Secondary)
                );
                gamestate.selectedNumbers.forEach((i) =>
                    numberbuttons[i].setStyle(Discord.ButtonStyle.Primary)
                );
                const row1 = new Discord.ActionRowBuilder();
                const row2 = new Discord.ActionRowBuilder();
                for (var i = 0; i < 5; i++) {
                    row1.addComponents(numberbuttons[i]);
                    row2.addComponents(numberbuttons[i + 5]);
                }
                gameMsg = await gameMsg.edit({
                    embeds: [embed],
                    components: [row1, row2],
                });

                try {
                    const confirmation =
                        await gameMsg.awaitMessageComponent({
                            filter,
                            time: 600000,
                        });

                    console.log(
                        gamestate.selectedNumbers.includes(
                            confirmation.customId
                        )
                    );
                } catch (e) {
                    var description =
                        'Your game should be saved (' + command.name;
                    if (command.short != '')
                        description += '/' + command.short;

                    description += ')';

                    saveGame(gameData);

                    embed
                        .setTitle('You Waited 10 minutes...')
                        .setDescription(description)
                        .setFooter({
                            text: 'This message will be deleted in 1 minute',
                        });
                    gameMsg.edit({ embeds: [embed], components: [] });

                    gameData.activegame = false;
                    await waitFor(60);
                    if (gameMsg.deletable) gameMsg.delete();
                }
        }
    }
}

function numberbtn(x) {
    return new Discord.ButtonBuilder()
        .setCustomId(`${x}`)
        .setLabel(`${x}`)
        .setStyle(Discord.ButtonStyle.Secondary);
}

async function saveGame(gameData) {
    const games = fs.existsSync(gamesFilePath)
        ? JSON.parse(fs.readFileSync(gamesFilePath).toString())
        : {};

    games[message.author.id] = gameData;

    fs.writeFileSync(gamesFilePath, JSON.stringify(games));
}

module.exports = command;
