const { Client, RichEmbed } = require('discord.js');
const handler = require('d.js-command-handler');
const util = require('util');
const fs = require('fs');
const parseTime = require('./utility/parseTime.js');
const token = process.env.BOT_TOKEN;

let client = new Client({ disableEveryone: true });
let loaders = util.promisify(fs.readdir)('./load').then((files) => files.map((n) => require(`./load/${n}`)), () => []);

client.ownerID = '432650511825633317';

handler.promptOptionsDefaults.formatTrigger = (prompt, ...args) => {
	if (typeof args[0] === 'string' && !args[1]) {
		return [
			new RichEmbed()
				.setColor('3ba6ed')
				.setTitle('Prompt')
				.setDescription(`${args[0]}\n\nSay **cancel** to cancel this prompt.`)
				.setFooter(`The prompt will automatically cancel in ${parseTime(prompt.options.time)}.`)
		];
	} else {
		return args;
	}
};

handler.promptOptionsDefaults.formatCorrect = (prompt, ...args) => {
	if ((!args[0] || typeof args[0] === 'string') && !args[1]) {
		return [
			new RichEmbed()
				.setColor('RED')
				.setTitle('Prompt Invalid Input')
				.setDescription(`Invalid input${args[0] ? `: \`\`${args[0]}\`\`` : '.'}\n\nPlease retry, or respond with \`cancel\` to end this prompt.`)
				.setFooter(`The prompt will end in ${parseTime(prompt.startedAt - Date.now() + prompt.options.time)}.`)
		];
	} else {
		return args;
	}
};

client.on('ready', async () => {
	console.log(client.user.username + ' has successfully booted up.');

	for (let loader of await loaders)
		if (typeof loader.exec === 'function')
			loader.exec(client);
});

handler(__dirname + '/commands', client, { customPrefix: ',' });

client.login(token);
