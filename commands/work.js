const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

//============================
var isDisabled = false;
var delay = 21600; //Time in seconds
//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	if(!(isDisabled && guild.id != '346430947421323267'))
		giveDaily(guild, client, message);
	else
		message.channel.send("**Work has been temporarily disabled.**");
}

async function giveDaily(guild, client, message)
{
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	//SQL end---

	currTime = Math.round((new Date()).getTime() / 1000); //Time in seconds
	if(memberInfo.lastDailyBal > currTime)
	{
		var hours = Math.floor(Math.abs(memberInfo.lastDailyBal - currTime) / 3600);
		var mins = Math.floor((Math.abs(memberInfo.lastDailyBal - currTime) % 3600) / 60);
		var sec = Math.floor(((Math.abs(memberInfo.lastDailyBal - currTime) % 3600) % 60));

		message.channel.send(message.author + " You've already used this command recently, please wait another **" + hours + " Hours, " + mins + " Minutes, " + sec + " Seconds** to claim more quarters.");
		message.channel.stopTyping();
		return;
	}


	var amount = Math.floor(Math.random() * 300) + 51; //From 50 > 300
	var comeBack = delay / 3600;

	message.channel.send(message.author + " You've recieved **" + amount + " Quarters** Come back again in **" + comeBack + " Hours** to get more!");
	memberInfo.lastDailyBal = currTime + delay;
	memberInfo.bal += amount;

	await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);

	message.channel.stopTyping();
}
