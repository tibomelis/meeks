const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ButtonBuilder()
    .setCustomId('help_commands')
    .setLabel('Commands')
    .setStyle(ButtonStyle.Secondary);
