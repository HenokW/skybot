const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

var limit = 10;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	var membersList = new Array(guild.members.array().length);
	for(_lb = 0; _lb < guild.members.array().length; _lb++)
	{
		membersList[_lb] = new Array(3);
		memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", guild.members.array()[_lb].id);

		membersList[_lb][0] = memberInfo.id;
		membersList[_lb][1] = memberInfo.level;
		membersList[_lb][2] = memberInfo.exp;
	}

	await membersList.sort((a, b) =>
	{
		if(a[1] == b[1])
			return b[2] - a[2];

		return b[1] - a[1];
	});

	var leveLEmbed = new Discord.RichEmbed()
		.setColor("#be243e")
		.setThumbnail(guild.iconURL)
		.setTitle("Server Levels Leaderboard")
		.setFooter("Levels leaderboard")
		.setTimestamp()
		.setAuthor(client.user.username + "#" + client.user.discriminator, client.user.displayAvatarURL);

	if(membersList.length < 10)
		limit = membersList.length;

	for(i = 0; i < limit; i++)
	{
		var userID = membersList[i][0];
		var userLevel = membersList[i][1];
		var userXP = membersList[i][2];

		leveLEmbed.addField(`${i + 1}.) Level **${userLevel}** - ${userXP}xp`, `<@${userID}>`, true);
	}

	message.channel.send({embed:leveLEmbed});
}
