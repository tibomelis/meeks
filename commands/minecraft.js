const { loadImage } = require('canvas');
const Discord = require('discord.js');
module.exports = {
    name: 'minecraft', // required! (usually the same as file name)
    short: 'mc', // if you want it
    description: '', // usefull, not required
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
        if (!args[0])
            return msg.channel.send(
                'no server ip included (mc <ip> <*port>)'
            );

        const data = await getData(args[0], args[1] ?? '');
        if (data.error)
            return msg.channel.send(
                'there was an error\n```' +
                    JSON.stringify(data.error) +
                    '```'
            );

        const embed = new Discord.EmbedBuilder();
        embed.setColor(`0x${randomColor()}`);
        var title = args.join(':');
        embed.setTitle(args[0]);
        embed.setImage('attachment://file.jpg');

        const file = new Discord.AttachmentBuilder();

        file.setFile(await getBuffer(args[0], args[1] ?? ''));

        msg.channel.send({ embeds: [embed], files: [file] });
    },
};

async function getBuffer(ip, port = '') {
    var url = `https://mcapi.us/server/image?theme=dark&ip=${ip}`;

    if (port != '') url = url + `&port=${port}`;

    return Buffer.from(await (await fetch(url)).arrayBuffer());
}
async function getData(ip, port = '') {
    var url = `https://mcapi.us/server/status?ip=${ip}`;

    if (port != '') url = url + `&port=${port}`;

    const r = await fetch(url);
    const json = await r.json();

    return json;
}
function randomColor() {
    const possible = '0123456789abcdef'.split('');
    var temp = '';
    for (var i = 0; i < 6; i++) {
        temp = temp.concat(
            possible[Math.floor(Math.random() * possible.length)]
        );
    }
    return temp;
}
