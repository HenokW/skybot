const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(message.member.hasPermission("ADMINISTRATOR"))
	{
		//Increment the guild command usage count
		var guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, "data", "guild", message.guild.id);

		newfix = args.shift();
		guildInfo.prefix = newfix;
		sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, config.guildSettingsSQLSetter, guildInfo);

		const prefixMessage = new Discord.RichEmbed()
			.setColor("#be243e")
			.setDescription("Your servers prefix has now been set to: **`" + newfix + "`**\n\n**Guild:** `" + guild.name + "`\n**Changed by:**" + message.author);

		message.channel.send({embed:prefixMessage});
	}
}
