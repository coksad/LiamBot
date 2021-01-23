const { client } = require('../load/database.js');

module.exports = {
	id: 'marketplacewhitelist',
	aliases: ['marketplaceblacklist'],
	exec: async (call) => {
		if (call.message.author.id !== call.client.ownerID)
			return call.message.channel.send('You do not have permission to use this command.');

		let user = call.args[0];

		if (!user)
			return call.message.channel.send('Please rerun the comand with a user to add or remove from the marketplace blacklist.');

		user = await call.client.users.get(user.replace(/\D+/g, ''));

		if (!user)
			return call.message.channel.send('Please rerun the comand with a valid user to add or remove from the marketplace blacklist.');

		let query = call.aliasUsed === 'marketplaceblacklist' ? client.query('INSERT INTO public.disallowed ("user") VALUES($1)', [user.id]) : client.query('DELETE FROM public.disallowed WHERE "user" = $2', [user.id]);

		query.then(() => call.message.channel.send(`Successfully ${call.aliasUsed === 'marketplacewhitelist' ? 'added' : 'removed'} this user from the blacklist.`),
			() => call.message.channel.send(`Failed to ${call.aliasUsed === 'marketplacewhitelist' ? 'add' : 'remove'} this user to the blacklist.`));
	}
};