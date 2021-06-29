const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();
	var userInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

	const myBal = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
		.setThumbnail(message.author.displayAvatarURL)
		.addField("My Balance", `${message.author}, has a balance of **${userInfo.bal} Quarters!**`);

	message.channel.send({embed:myBal});
	message.channel.stopTyping();
}
