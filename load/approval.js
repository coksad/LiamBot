const { RichEmbed } = require('discord.js');

const APPROVAL_CHANNEL = '800694727590412299';
const HIGHLIGHT_PING_ROLE = '800675769411567639';

module.exports = {
	id: 'approval',
	exec: async (client) => {
		client.approvalChannel = client.channels.get(APPROVAL_CHANNEL);
		client.HIRING_DEVELOPER_TYPES = {
			cafe: '800694110943051787',
			juicebar: '800694140006039583',
			school: '800694177821753355',
			airport: '800694219312201738',
			army: '800694219312201738',
			everything_else: '800694232486510673'
		};
		client.FOR_HIRE_DEVELOPER_TYPES = {
			cafe: '800694301696720896',
			juicebar: '800694317713719297',
			school: '800694335636766730',
			airport: '800694358647111751',
			army: '800694404830199848',
			everything_else: '800694417706188850'
		};

		if (!client.approvalChannel)
			return console.warn('Approval channel in load/approval.js not found.');

		client.on('messageReactionAdd', async (messageReaction, reactor) => {
			let { message, emoji } = messageReaction;
			let embed = message.embeds[0];

			if (reactor.bot || !embed || message.channel.id !== APPROVAL_CHANNEL || message.deleted)
				return;

			embed = new RichEmbed(embed);

			let user = embed.author.name.match(/\d+$/);

			if (!user)
				return;

			let member = message.guild.member(user[0]);
			let [type, channel, premium] = embed.footer.text.split(' ');
			let channelData = (type === 'hiring' ? client.HIRING_DEVELOPER_TYPES : client.FOR_HIRE_DEVELOPER_TYPES);

			if (emoji.name === '✅') {
				if (premium)
					await message.guild.roles.get(HIGHLIGHT_PING_ROLE).setMentionable(true);

				client.channels.get(channelData[channel]).send(premium ? `<@&${HIGHLIGHT_PING_ROLE}>` : '', { embed: embed.setColor(premium ? 'DAA520' : 'GREEN').setFooter(`RoAdvertiser | Approved by ${reactor.username}`) });

				if (premium)
					message.guild.roles.get(HIGHLIGHT_PING_ROLE).setMentionable(false);

				message.delete();
				member.send(`Your post has been approved by ${reactor} (${reactor.tag}).`, { embed: embed.setColor('GREEN') });
			} else if (emoji.name === '❌') {
				message.delete();

				member.send(`Your post has been denied by ${reactor} (${reactor.tag}).`, { embed: embed.setColor('RED') });
			} else if (emoji.name === '✏️') {
				await reactor.send(`What channel do you want the post to be? Choices: \`${Object.keys(channelData).join('`, `')}\`, \`cancel\``);

				channel = await reactor.dmChannel.awaitMessages((m) => Object.keys(channelData).includes(m.content.toLowerCase()) || m.content.toLowerCase() === 'cancel',
					{ time: 180000, maxProcessed: 10, max: 1, errors: ['time'] })
					.then((ms) => ms.first() && ms.first().content)
					.catch(() => null);

				if (!channel || channel.toLowerCase() === 'cancel')
					return reactor.send('Cancelled the prompt.');

				message.edit({ embed: embed.setFooter(`${type} ${channel}`) });
				reactor.send('Changed the channel.');
			}
		});
	}
};

