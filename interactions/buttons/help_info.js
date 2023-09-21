const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ButtonBuilder()
    .setCustomId('help_info')
    .setLabel('Bot Info')
    .setStyle(ButtonStyle.Secondary);
