const Discord = require("discord.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	try
	{
		id = args.shift();
		lookup = await client.fetchUser(id);

		const userEmbed = new Discord.RichEmbed()
			.setColor("#2489be")
			.setAuthor(`${lookup.username}#${lookup.discriminator}`, lookup.displayAvatarURL)
			.setThumbnail(lookup.displayAvatarURL)
			.setFooter(`User ID: ${lookup.id}`)
			.setTitle("User: " + lookup.username + "#" + lookup.discriminator)
			.addField(`Is a bot:`, lookup.bot)
			.addField(`Created on:`, lookup.createdAt);

		message.channel.send({embed:userEmbed});
	}
	catch(e)
	{
		errorMsg(client, message, "Invalid user ID, please try again.", Discord);
	}

	message.channel.stopTyping();
}