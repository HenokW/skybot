const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

//============================
var isDisabled = false;

//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	if(!(isDisabled && guild.id != '346430947421323267'))
		giveWeekly(guild, client, message);
	else
		message.channel.send("**Weekly has been temporarily disabled.**");
}

async function giveWeekly(guild, client, message)
{
	//SQL
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	//SQL end---

	currTime = Math.round((new Date()).getTime() / 1000);
	if(memberInfo.lastWeekly > currTime)
	{
		var day = Math.floor(Math.abs(memberInfo.lastWeekly - currTime) / 86400)
		var hours = Math.floor(Math.abs(memberInfo.lastWeekly - currTime) / 3600);
		var mins = Math.floor((Math.abs(memberInfo.lastWeekly - currTime) % 3600) / 60);
		var sec = Math.floor(((Math.abs(memberInfo.lastWeekly - currTime) % 3600) % 60));

		if(hours > 24)
			hours = Math.floor((Math.abs(memberInfo.lastWeekly - currTime) % 86400) / 3600);

		message.channel.send(message.author + " You've already used this command recently, please wait another **" + day + " Days, " + hours + " Hours, " + mins + " Minutes, " + sec + " Seconds** to claim another daily crate.");
		message.channel.stopTyping();
		return;
	}

	var amount = Math.floor(Math.random() * 1000 - 250) + 251;
	message.channel.send(message.author + " You've recieved **" + amount + " Quarters, and a FREE crate!** Come back again in a **Week** to get another.");

	memberInfo.lastWeekly = currTime + 604800;
	memberInfo.crates++;
	memberInfo.bal += amount;
	memberInfo.balTotal += amount;

	await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);

	message.channel.stopTyping();
}
