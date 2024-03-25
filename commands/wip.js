const Discord = require('discord.js');
const fs = require('fs');

const Dice = require('../customTools/Dice');
const { rowYN } = require('./../interactions/buttons/rowYN');

const gamesFilePath = './storage/shutthebox.json';

/** @type {Discord.Message} */
var msg_main, msg_game;

const COLORS = {
    gray_hintofred: '#ccffcc',
    gray_hintofgreen: '#ccffcc',
    gray_hintofblue: '#ccccff',

    white: '#ffffff',
    gray: '#cccccc',
    darkgray: '#999999',
    black: '#000000',
};

const GAMESTAGES = {
    Starting: 0,
    NumberCheck: 1,
};

var GAME_INFO = 'No info atm';

const filter = (i) => i.user.id === msg_main.author.id;

const command = {
    name: 'wip', // required! (usually the same as file name)
    short: 'stb', // if you want it
    description: 'work in progress', // usefull, not required
    category: 'wip', // empty for 'misc'
    disabled: false,

    /**
     * Executes the command in te command handler
     * @param {Discord.Client} client   // your bot client
     * @param {Discord.Message} msg     // the message that triggered this command
     * @param {Array} args              // any arguments passed trough the command
     * @param {String} curPrefix        // this bot prefix
     */
    async execute(client, msg, args, curPrefix) {
        msg_main = msg; // store the msg in msg_main (so everything can use it)

        msg.delete();

        if (!fs.existsSync('./storage')) fs.mkdirSync('./storage'); // check if the storage folder exists

        // get the current games
        const games = fs.existsSync(gamesFilePath)
            ? JSON.parse(fs.readFileSync(gamesFilePath).toString())
            : {};

        if (games[msg_main.author.id]?.activegame) {
            // active game
            const embed = embedGame()
                .setTitle('Active Game.')
                .setDescription(
                    'You have a active game. Would you like to stop that game?'
                );

            const response = await msg_main.channel.send({
                embeds: [embed],
                components: [rowYN],
            });

            try {
                // wait for interaction
                const confirmation = await response.awaitMessageComponent({
                    filter,
                    time: 60000,
                });

                // if there was a interaction
                if (confirmation.customId == 'y') {
                    // stop active game.
                    games[msg_main.author.id].activegame = false;
                    games[msg_main.author.id].gamestate = {};

                    embed
                        .setTitle('Active Game deleted.')
                        .setColor(COLORS.gray_hintofgreen)
                        .setDescription(' ');
                    saveGame(games[msg_main.author.id]);
                } else if (confirmation.customId == 'n') {
                    // dont stop active game

                    embed
                        .setTitle('Active Game *not* deleted.')
                        .setColor(COLORS.gray)
                        .setDescription(' ');
                }

                response.edit({
                    embeds: [embed],
                    components: [],
                });
            } catch (e) {
                embed
                    .setDescription('No reaction was given in one minute.')
                    .setColor(COLORS.gray_hintofred)
                    .setFooter({
                        text: 'This message will be deleted in 10 seconds',
                    });

                response.edit({ embeds: [embed], components: [] });

                waitFor(10, () => {
                    if (response.deletable) response.delete();
                });

                return;
            }

            embed.setFooter({
                text: 'This message will be deleted in 10 seconds',
            });

            response.edit({ embeds: [embed] });

            waitFor(10, () => {
                if (response.deletable) response.delete();
            });
        }

        // start/resume the game
        mainGame();
    },
};
async function waitFor(seconds = 1, onend = () => {}) {
    return new Promise((res) =>
        setTimeout(() => {
            onend();
            res();
        }, seconds * 1000)
    );
}

async function mainGame() {
    // init game message
    msg_game = await msg_main.channel.send({
        embeds: [embedGame().setTitle('Loading...')],
    });

    // Game setup
    const gameData = {};

    gameData.activegame = false;
    gameData.wins = 0;
    const gs = new GameState();
    gameData.gamestate = gs;

    gameData.activegame = true;

    // wait 1 second before starting (this is purely so the loading looks like its actually loading something for a bit longer lol)
    await waitFor();

    // state based game loop
    while (gameData.activegame) {
        switch (gs.state) {
            case GAMESTAGES.Starting:
                // start of a new game
                var embed = embedGame()
                    .setColor(COLORS.gray_hintofblue)
                    .setTitle('New Game')
                    .setDescription('Start new game?');

                msg_game.edit({
                    embeds: [embed],
                    components: [rowYN],
                });

                try {
                    const confirmation =
                        await msg_game.awaitMessageComponent({
                            filter,
                            time: 600000, // 60 seconds * 1000 for ms * 10 for 10 minutes = 600.000
                        });

                    if (confirmation.customId == 'y') {
                        embed
                            .setTitle('Okay, have fun!')
                            .setDescription('Game will start soon!')
                            .setColor(COLORS.gray_hintofgreen);

                        msg_game.edit({
                            embeds: [embed],
                            components: [],
                        });

                        await waitFor(2);

                        gs.state = GAMESTAGES.NumberCheck;

                        break;
                    } else if (confirmation.customId == 'n') {
                        // format embed
                        embed
                            .setTitle('OK!')
                            .setColor(COLORS.gray_hintofgreen)
                            .setDescription(
                                `Use ${command.name} ${
                                    command.short != ''
                                        ? '(or ' + command.short + ')'
                                        : ''
                                } to start a new game`
                            )
                            .setFooter({
                                text: 'Message will be deleted in 10 seconds',
                            });

                        msg_game.edit({
                            embeds: [embed],
                            components: [],
                        });

                        gameData.activegame = false;
                        saveGame(gameData); // save the data

                        // delete message after a minute
                        waitFor(10, () => {
                            if (msg_game.deletable) msg_game.delete();
                        });

                        break;
                    }
                } catch (e) {
                    // format embed
                    embed
                        .setTitle('Nothing Selected.')
                        .setDescription(
                            'Restart by using the command again.'
                        )
                        .setFooter({
                            text: 'Message will be deleted in 1 minute',
                        });

                    msg_game.edit({ embeds: [embed], components: [] });
                    gameData.activegame = false;
                    saveGame(gameData);

                    waitFor(60, () => {
                        if (msg_game.deletable) msg_game.delete();
                    });
                }

                break;

            case GAMESTAGES.NumberCheck:
                gs.moves++;

                // check if more than 2 selected numbers
                if (gs.selectedNumbers.length > 2) {
                    // cant have more than 2 selected numbers
                    GAME_INFO = "You can't select more than 2 numbers";
                    gs.state = GAMESTAGES.NumberSelect;
                    break;
                }

                if (gs.selectedTotal > gs.requiredTotal) {
                    // to much
                    GAME_INFO = 'That is too much.';
                    gs.state = GAMESTAGES.NumberSelect;
                    break;
                }
                if (gs.selectedTotal < gs.requiredTotal) {
                    // not enough
                    GAME_INFO = 'That is not enough.';
                    gs.state = GAMESTAGES.NumberSelect;
                    break;
                }

                if (gs.selectedTotal == gs.requiredTotal) {
                    GAME_INFO = 'No info atm';

                    if (gs.selectedNumbers == 1) {
                        // 1 number selected
                    } else {
                        // 2 numbers selected
                    }

                    gs.selectedNumbers.forEach((x) =>
                        removeItemOnce(gs.numberActive, x)
                    );

                    gs.selectedNumbers.forEach((x) =>
                        gs.inactiveNumbers.push(x)
                    );

                    gs.state = GAMESTAGES.NumberSelect;
                }

            //

            case GAMESTAGES.NumberSelect:
                var embed = embedGame()
                    .setTitle('Active game.')
                    .setColor(COLORS.gray_hintofblue)
                    .setDescription(
                        `Numbers thrown are ${die1} and ${die2}`
                    )
                    .addFields(
                        {
                            name: 'Required total',
                            value: `Select 1 or 2 die to create a total of ${gs.requiredTotal}`,
                        },
                        {
                            name: 'Current total',
                            value: `Your current total is: ${gs.selectedTotal}`,
                        },
                        {
                            name: 'Info',
                            value: GAME_INFO,
                        }
                    );

                numberbuttons.forEach((btn) =>
                    btn.setStyle(Discord.ButtonStyle.Secondary)
                );
                gs.selectedNumbers.forEach((i) =>
                    numberbuttons[i].setStyle(Discord.ButtonStyle.Primary)
                );
                gs.inactiveNumbers.forEach((i) => {
                    numberbuttons[i].setStyle(Discord.ButtonStyle.Success);
                });

                const row1 = new Discord.ActionRowBuilder();
                const row2 = new Discord.ActionRowBuilder();

                for (var i = 0; i < 5; i++) {
                    row1.addComponents(numberbuttons[i]);
                    row2.addComponents(numberbuttons[i + 5]);
                }

                msg_game.edit({
                    embeds: [embed],
                    components: [row1, row2],
                });

                try {
                    const confirmation =
                        await msg_game.awaitMessageComponent({
                            filter,
                            time: 600000,
                        });

                    var selectedNum = confirmation.customId;

                    if (gs.selectedNumbers.includes(selectedNum)) {
                        removeItemOnce(gs.selectedNumbers, selectedNum);
                    } else {
                        gs.selectedNumbers.push(selectedNum);
                    }
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
                            text: 'This message will be deleted in 10 seconds',
                        });
                    msg_game.edit({ embeds: [embed], components: [] });

                    gameData.activegame = false;

                    waitFor(10, () => {
                        if (msg_game.deletable) msg_game.delete();
                    });
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

    games[msg_main.author.id] = gameData;

    fs.writeFileSync(gamesFilePath, JSON.stringify(games));
}

function embedGame() {
    return new Discord.EmbedBuilder()
        .setColor(COLORS.black)
        .setTitle('DEFAULT TITLE')
        .setAuthor({
            name:
                'Playing: ' + msg_main.member.nickname ??
                msg_main.member.displayName,
            iconURL: msg_main.member.avatarURL({
                size: 1024,
                extension: 'jpg',
            }),
        });
}

/**
 *
 * @param {Array} arr
 * @param {any} value
 * @returns {void}
 */
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

class ShutTheBox {
    playerId = 0;
    gamestate = GAMESTAGES.Starting;

    movesTaken = 0;
    numbersDeactivated = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
    };

    selectedNum1 = 0;
    selectedNum2 = 0;

    die1 = new Dice();
    die2 = new Dice();

    row1 = [
        numberbtn(1),
        numberbtn(2),
        numberbtn(3),
        numberbtn(4),
        numberbtn(5),
    ];
    row2 = [
        numberbtn(6),
        numberbtn(7),
        numberbtn(8),
        numberbtn(9),
        numberbtn(10),
    ];

    constructor(userId) {
        this.playerId = userId;
    }

    get requiredTotal() {
        return this.die1.num + this.die2.num;
    }

    get selectedTotal() {
        return this.selectedNum1 + this.selectedNum2;
    }

    get numbersButtonRow1() {
        for (var i of this.row1) {
            console.log(i);
        }
    }
    get numbersButtonRow2() {}

    get savedata() {
        return {
            gamestate: this.gamestate,
            movesTaken: this.movesTaken,
            numbersDeactivated: JSON.stringify(this.numbersDeactivated),
            selectedNum1: this.selectedNum1,
            selectedNum2: this.selectedNum2,
            die1: { num: this.die1.num, sides: this.die1.sides },
            die2: { num: this.die2.num, sides: this.die2.sides },
        };
    }

    saveGame() {
        if (!fs.existsSync('./storage')) fs.mkdirSync('./storage');
        if (!fs.existsSync(gamesFilePath))
            fs.writeFileSync(gamesFilePath, '{}');

        const games = JSON.parse(
            fs.readFileSync(gamesFilePath).toString()
        );

        games[this.playerId] = this.savedata;

        fs.writeFileSync(gamesFilePath, JSON.stringify(games));
    }

    get availableNumbers() {
        var available = [];
        for (var n in this.numbersDeactivated) {
            if (!this.numbersDeactivated[n]) available.push(parseInt(n));
        }
        return available;
    }

    get isPossible() {
        // check if the required total is one of the available numbers
        if (this.availableNumbers.includes(this.requiredTotal))
            return true;

        // check combination
        const available = this.availableNumbers;
        var num2options;

        for (var i = 0; i < available.length; i++) {
            const num1 = available[i];
            num2options = available.filter((x) => x != num1);
            for (var j = 0; j < num2options.length; j++) {
                const num2 = num2options[j];

                const combination = num1 + num2;

                if (combination == this.requiredTotal) return true;
            }
        }

        // no combination was possible
        return false;
    }

    static fromUserId(userid) {
        if (!fs.existsSync('./storage') || !fs.existsSync(gamesFilePath))
            return null;

        const games = JSON.parse(
            fs.readFileSync(gamesFilePath).toString()
        );

        if (games[userid] == undefined) return null;

        const gd = games[userid];

        const stb = new ShutTheBox();

        stb.playerId = userid;

        stb.gamestate = gd.gamestate;
        stb.movesTaken = gd.movesTaken;
        stb.numbersDeactivated = JSON.parse(gd.numbersDeactivated);
        stb.selectedNum1 = 0;
        stb.selectedNum2 = 0;

        stb.die1.num = gd.die1.num;
        stb.die1.sides = gd.die1.sides;

        stb.die2.num = gd.die2.num;
        stb.die2.sides = gd.die2.sides;

        return stb;
    }
}

module.exports = command;
