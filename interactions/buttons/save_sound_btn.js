const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new ButtonBuilder()
    .setCustomId('savesound')
    .setLabel('Save Sound')
    .setEmoji('🗃️')
    .setStyle(ButtonStyle.Success);
