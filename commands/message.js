module.exports = {
	id: 'message',
	aliases: ['dm'],
	channels: 'guild',
	exec: async (call) => {
		if (!call.message.member.roles.has('800673509310201886'))
			return call.message.channel.send('You do not have permission to use this command.');

		let user = call.args[0];

		if (!user)
			return call.message.channel.send('Please rerun the comand with a user to message. e.g. `!message @user Hello. This is a bot message.`');

		user = await call.client.users.get(user.replace(/\D+/g, ''));

		if (!user)
			return call.message.channel.send('Please rerun the comand with a valid user message. e.g. `!message @user Hello. This is a bot message.`');

		let content = call.cut.substring(call.args[0].length);

		user.send(content);
	}
};
