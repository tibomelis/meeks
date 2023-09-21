const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ButtonBuilder()
    .setCustomId('help_home')
    .setLabel('Home')
    .setStyle(ButtonStyle.Primary);
