require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { token, botId } = process.env;
const fs = require('fs');
const path = require('path');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'interactions');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./interactions/${file}`);
    commands.push(command.data.toJSON());
}

const DELETECOMMANDS = true;
const ADDCOMMANDS = true;

// Construct and prepare an instance of the REST module

const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
    console.log(
        `[refreshing] ${commands.length} application (/) commands.\n`
    );

    if (DELETECOMMANDS) {
        await deleteExistingCommands();
    }
    if (ADDCOMMANDS) {
        await addNewCommands();
    }
})();

async function deleteExistingCommands() {
    // Try getting existing commands
    try {
        console.log('[GET] existing commands.\n');
        const cmds = await rest.get(Routes.applicationCommands(botId));

        console.log(`[OK] ${cmds.length} commands.\n`);

        // try deleting existing commands
        try {
            if (cmds.length > 0) {
                console.log(`[DELETE] ${cmds.length} commands.\n`);
                for (var i = cmds.length - 1; i >= 0; i--) {
                    await rest.delete(
                        Routes.applicationCommand(botId, cmds[i].id)
                    );
                    console.log(`[OK] deleted ${cmds[i].name}`);
                }
            }
        } catch (error) {
            console.error(`[Error] while deleting commands:\n${error}`);
        }
    } catch (error) {
        console.error(`[Error] while retrieving commands:\n${error}`);
    }
}

async function addNewCommands() {
    // try saving new commands
    try {
        console.log(`\n[PUT] ${commands.length} commands...\n`);
        const dataglobal = await rest.put(
            Routes.applicationCommands(botId),
            {
                body: commands,
            }
        );

        console.log(
            `[OK] reloaded ${dataglobal.length} application (/) commands.\n`
        );
    } catch (error) {
        console.error(`Error while loading commands:\n${error}`);
    }
}
