const Discord = require("discord.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	message.channel.stopTyping();
	message.channel.send(`${message.author}, you've rolled a **${Math.floor(Math.random() * 6) + 1}!**`);
}