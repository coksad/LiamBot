const { RichEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { client } = require('../load/database.js');

const LINK_REGEX = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;
const PREMIUM_ROLE = '800662484276740126';
const MAIN_SERVER = '800652883270959124';

function getIDFromUsername(username) {
	return fetch(`https://api.roblox.com/users/get-by-username?username=${username}`)
		.then((res) => res.json())
		.then((json) => json.Id);
}

async function payments(call) {
	let paymentOptions = ['robux', 'percentage', 'money'],
		payments = '',
		ranOnce = false,
		amount;

	while (paymentOptions.length > 1) {
		let payment = await call.prompt(`${ranOnce ? 'Is there any other form of' : 'What is the'} payment for this job? Options: \`${paymentOptions.join('`, `')}\``,
			{ filter: paymentOptions, channel: call.message.author.dmChannel })
			.then((message) => message.content.toLowerCase());

		if (!ranOnce)
			paymentOptions = ['robux', 'percentage', 'money', 'done'];

		ranOnce = true;

		if (payment === 'done')
			break;

		paymentOptions.splice(paymentOptions.indexOf(payment), 1);
		amount = await call.prompt(
			payment === 'robux' ? 'How much robux are you offering for this job?' :
				payment === 'money' ? 'How much money (and in what currency) are you offering for this job?' :
					payment === 'percentage' ? 'How much percentage are you offering for this job?' : 'An impossible error occured.',
			{
				filter: /\d/,
				correct: 'Input must include a number',
				channel: call.message.author.dmChannel
			}).then((message) => message.content.toLowerCase().replace(/\d{4,}/g, (m) => parseInt(m).toLocaleString()));
		payments += `**${payment.toLowerCase().replace(/\b[^ o]/g, (c) => c.toUpperCase())}:** ${amount}\n`;
	}

	return payments;
}

async function contacts(call) {
	let contactOptions = ['discord', 'roblox', 'twitter'],
		contacts = '',
		ranOnce = false;

	while (contactOptions.length > 1) {
		let contact = await call.prompt(`Where ${ranOnce ? 'else ' : ''}can you be contacted from? Options: \`${contactOptions.join('`, `')}\``,
			{ filter: contactOptions, channel: call.message.author.dmChannel })
			.then((message) => message.content.toLowerCase());

		if (!ranOnce)
			contactOptions = ['discord', 'roblox', 'twitter', 'done'];

		ranOnce = true;

		if (contact === 'done')
			break;

		contactOptions.splice(contactOptions.indexOf(contact), 1);

		let detail;

		if (contact !== 'discord') {
			detail = await call.prompt(contact === 'roblox' ? 'What is your Roblox username?' : 'What is your Twitter handle?',
				{
					filter: contact === 'twitter' ? /^@?(\w){1,15}$/ : contact === 'roblox' ? /^(?=.{3,20}$)^[[a-z0-9]+([_ ][a-z0-9]+)?$/i : () => true,
					channel: call.message.author.dmChannel
				})
				.then((message) => message.content.toLowerCase());
		}

		contacts += (contact === 'discord' ? `**Discord:** ${call.message.author}\n` :
			contact === 'roblox' ? `**Roblox:** [${detail}](https://www.roblox.com/users/${await getIDFromUsername(detail)}/profile)\n` :
				`**Twitter:** [${detail}](https://twitter.com/${detail.match(/^@?(\w){1,15}$/)[0]})\n`);
	}

	return contacts ? contacts : 'skip';
}

module.exports = {
	id: 'post',
	exec: async (call) => {
		if (await client.query('SELECT "user" FROM public.disallowed WHERE "user" = $1', [call.message.author.id]).then((res) => res.rows[0]))
			return call.message.channel.send('You are blacklisted from the marketplace.');

		if (call.message.channel.type === 'text')
			call.message.channel.send('The prompt will continue in your direct messages. If you do not receive a direct message, please change your privacy settings and try again.');

		call.message.channel = await call.message.author.createDM();

		let type = await call.prompt('Is this a `hiring` or `for-hire` post?', { filter: ['hiring', 'for-hire'], correct: 'Invalid input. Input must be either `hiring` or `for-hire`. Please retry' })
			.then((m) => m.content.toLowerCase());

		let mainType = type;

		if (type === 'hiring') {
			console.log(call.client.HIRING_DEVELOPER_TYPES);
			type = await call.prompt(`What type of service are you looking for? Options: \`${Object.keys(call.client.HIRING_DEVELOPER_TYPES).join('`, `')}\``,
				{ filter: Object.keys(call.client.HIRING_DEVELOPER_TYPES) }).then((m) => m.content.toLowerCase());
		} else {
			type = await call.prompt(`What type of industry are you for-hire in? Options: \`${Object.keys(call.client.FOR_HIRE_DEVELOPER_TYPES).join('`, `')}\``,
				{ filter: Object.keys(call.client.FOR_HIRE_DEVELOPER_TYPES) }).then((m) => m.content.toLowerCase());
		}

		let description = await call.prompt('Please provide any additional information regarding this post.')
			.then((m) => m.content);
		let payment = await payments(call);
		let contact = await contacts(call);
		let deadline = 'none';

		if (type === 'hiring')
			deadline = call.prompt('Is there any deadline for this post? If not, say `none`.').then((m) => m.content);

		let image = await call.prompt('Are there any images you wish to include with this post? If so, please provide them in HTTP(S) link or attachment format. If not, respond with `no`.',
			{ filter: (m) => m.content.toLowerCase() === 'no' || m.attachments.size || LINK_REGEX.test(m.content), correct: 'Invalid input. Please retry with a valid *HTTP(S)* link or attachment.' })
			.then((m) => m.content.toLowerCase() !== 'no' ? m.attachments.size ? m.attachments.first().url : m.content : undefined);

		let embed = new RichEmbed()
			.setColor('GREEN')
			.setAuthor(`${call.message.author.tag} - ${call.message.author.id}`, call.message.author.displayAvatarURL)
			.setTitle('RoAdvertiser Marketplace')
			.setDescription(description)
			.addField('Payment', payment)
			.addField('Contact', contact)
			.setFooter(`${mainType} ${type} ${(call.client.guilds.get(MAIN_SERVER) && call.client.guilds.get(MAIN_SERVER).members.has(call.message.author.id) && call.client.guilds.get(MAIN_SERVER).members.get(call.message.author.id).roles.has(PREMIUM_ROLE)) ? 'PREMIUM' : ''}`)
			.setImage(image);

		if (deadline.toLowerCase() !== 'none')
			embed.addField('Deadline', deadline);

		await call.message.channel.send('Here is a preview of your post. Do you wish to send for approval?', { embed })
			.catch(() => call.message.channel.send('Here is a preview of your post, do you wish to send for approval? (`yes` or `no`)?', { embed: embed.setImage(undefined) }));

		let confirmation = await call.prompt(null, { filter: ['yes', 'no'], correct: 'Invalid input. Please retry with either `yes` or `no`' })
			.then((m) => m.content.toLowerCase());

		if (confirmation === 'no')
			return call.message.channel.send('Cancelled post.');

		call.client.approvalChannel.send(embed).then((m) => {
			call.message.channel.send('Message successfully sent for approval.');

			m.react('✅');
			m.react('❌');
			m.react('✏️');
		}, () => {
			call.message.channel.send('Failed to send your post for approval. If this error persists, please contact an Administrator.');
		});
	}
};
