const Discord = require("discord.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	num = Math.floor(Math.random() * 2)? results = "Heads" : results = "Tails";
	message.channel.send(`${message.author}, **${results}!**`);

	message.channel.stopTyping();
}