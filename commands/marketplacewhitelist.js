const { client } = require('../load/database.js');

module.exports = {
	id: 'marketplacewhitelist',
	aliases: ['marketplaceblacklist'],
	channels: 'guild',
	exec: async (call) => {
		if (!call.message.member.roles.has('800673509310201886'))
			return call.message.channel.send('You do not have permission to use this command.');

		let user = call.args[0];

		if (!user)
			return call.message.channel.send('Please rerun the comand with a user to add or remove from the marketplace blacklist.');

		user = await call.client.users.get(user.replace(/\D+/g, ''));

		if (!user)
			return call.message.channel.send('Please rerun the comand with a valid user to add or remove from the marketplace blacklist.');

		let reason = call.cut.substring(call.args[0].length).trim();

		let isBlacklisted = !!await client.query('SELECT "user" FROM public.disallowed WHERE "user" = $1', [user.id]).then((res) => res.rows[0]);

		if (call.aliasUsed === 'marketplaceblacklist' && isBlacklisted)
			return call.message.channel.send('This user is already blacklisted.');
		else if (call.aliasUsed === 'marketplacewhitelist' && !isBlacklisted)
			return call.message.chanel.send('This user is not blacklisted.');

		let query = call.aliasUsed === 'marketplaceblacklist' ? client.query('INSERT INTO public.disallowed ("user") VALUES($1)', [user.id]) : client.query('DELETE FROM public.disallowed WHERE "user" = $1', [user.id]);

		query.then(() => call.message.channel.send(`Successfully ${call.aliasUsed === 'marketplacewhitelist' ? 'removed' : 'added'} this user to the blacklist.`),
			(err) => console.warn(err.stack) || call.message.channel.send(`Failed to ${call.aliasUsed === 'marketplacewhitelist' ? 'remove' : 'add'} this user from the blacklist.`));

		if (reason)
			user.send(`You have been ${call.aliasUsed === 'marketplaceblacklist' ? 'banned' : 'unbanned'} from posting on the marketplace for \`${reason}\``);
	}
};