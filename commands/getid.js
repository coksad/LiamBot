module.exports = {
	id: 'getid',
	aliases: ['id'],
	exec: (call) => {
		let input = call.cut.toLowerCase();

		if (!input)
			return call.message.channel.send('Please provide a user to get the id from. e.g. `!getid liam.#1000`');

		let user = call.message.mentions.users.find((u) => u.id !== call.client.user.id) ||
			call.client.users.cache.find((u) => u.tag.toLowerCase() === input) ||
			call.client.users.cache.find((u) => u.username.toLowerCase() === input);

		if (!user)
			return call.message.channel.send(`No user found for the given input \`\`${input.substring(0, 15)}}\`\`.`);

		call.message.channel.send('The user ID is:')
			.then(() => call.message.channel.send(user.id));
	}
};