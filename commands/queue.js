const { MessageEmbed } = require('discord.js');
const { client } = require('../load/database.js');

function fetchSize(channel) {
	return channel.messages.fetch({ limit: 100 }).then((ms) => ms.filter((m) => m.author.bot).size);
}

module.exports = {
	id: 'queue',
	aliases: ['pending', 'q'],
	desc: 'Tells you how many posts are awaiting approval.',
	exec: async (call) => {
		let marketplaceApproval = call.client.approvalChannel;

		call.message.channel.send(
			new RichEmbed()
				.setColor(call.client.hex)
				.setTitle('Pending')
				.setDescription(`Marketplace Posts: \`${await fetchSize(marketplaceApproval)}\``)
				.setFooter(`Requested by ${call.message.author.username}`, call.message.author.displayAvatarURL())
		);
	}
};
