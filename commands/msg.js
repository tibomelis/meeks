const Discord = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
module.exports = {
    name: 'msg',
    short: '',
    description: 'send a message to a chatbot',
    category: 'Misc',
    disabled: false,

    /**
     *
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args
     * @param {String} curPrefix
     */
    async execute(client, msg, args, curPrefix) {
        const path = './storage/aichathistory.json';
        const history = fs.existsSync(path)
            ? JSON.parse(fs.readFileSync(path))
            : [];
        while (history.length > 75) {
            history.shift();
        }

        await msg.channel.sendTyping();

        args = args.length == 0 ? 'hi' : args;

        const configuration = new Configuration({
            organization: process.env.OPENAIORGANIZATION,
            apiKey: process.env.OPENAIKEY,
        });
        const openai = new OpenAIApi(configuration);

        history.push({
            role: 'user',
            content: msg.author.username + ' says: ' + args.join(' '),
        });
        try {
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: history,
            });

            const reply = completion.data.choices[0].message.content;
            await msg.channel.send(reply);

            history.push({ role: 'assistant', content: reply });

            fs.writeFileSync(path, JSON.stringify(history));
        } catch (err) {
            msg.channel.send(
                "`That didn't work...` ```" + err.stack + '```'
            );
        }
    },
};
