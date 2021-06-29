const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

var limit = 10;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	let membersList = new Array(guild.members.array().length);
	for(_lb = 0; _lb <guild.members.array().length; _lb++)
	{
		membersList[_lb] = new Array(2);
		memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", guild.members.array()[_lb].id);

		membersList[_lb][0] = memberInfo.id;
		membersList[_lb][1] = memberInfo.bal;
	}

	await membersList.sort((a, b) => {return b[1] - a[1]});
	const embed = new Discord.RichEmbed()
		.setColor("#be243e")
		.setThumbnail(guild.iconURL)
		.setTitle("Server Balance Leaderboard")
		.setFooter("Balance leaderboard")
		.setTimestamp()
		.setAuthor(client.user.username + "#" + client.user.discriminator, client.user.displayAvatarURL);

	if(membersList.length < 10)
		limit = membersList.length;

	for(i = 0; i < limit; i++)
	{
		userID = membersList[i][0];
		userLevel = membersList[i][1];

		embed.addField(`${i + 1}.) **${userLevel}** Quarters`, `<@${userID}>`, true);
	}

	message.channel.send({embed});
}
