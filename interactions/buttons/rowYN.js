const Discord = require('discord.js');

const btnYes = new Discord.ButtonBuilder()
    .setCustomId('y')
    .setLabel('Yes')
    .setStyle(Discord.ButtonStyle.Secondary);
const btnNo = new Discord.ButtonBuilder()
    .setCustomId('n')
    .setLabel('No')
    .setStyle(Discord.ButtonStyle.Secondary);

const rowYN = new Discord.ActionRowBuilder().addComponents(btnNo, btnYes);

module.exports = { btnYes, btnNo, rowYN };
