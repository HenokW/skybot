const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

//============================
const isDisabled = false;
const dayCycle = 86400; //How long someone has to claim their daily reward before their streak ends. (Time in seconds. Default: 86400)
const streakReward = 35; //Streaks up to 5 days (day * streakReward = bonus)

//Emotes
const red_line = '<:red_line:566645744476618772>';
const green_line = '<:green_line:566645744359047178>';
//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	if(!(isDisabled && guild.id != '346430947421323267'))
		giveDaily(guild, client, message);
	else
		message.channel.send("**Crates have been temporarily disabled.**");
}

async function giveDaily(guild, client, message)
{
	//SQL
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

	//SQL end---
	let currTime = Math.round((new Date()).getTime() / 1000);
	if(memberInfo.lastCrate > currTime)
	{
		var hours = Math.floor(Math.abs(memberInfo.lastCrate - currTime) / 3600);
		var mins = Math.floor((Math.abs(memberInfo.lastCrate - currTime) % 3600) / 60);
		var sec = Math.floor(((Math.abs(memberInfo.lastCrate - currTime) % 3600) % 60));

		message.channel.send(message.author + " You've already used this command recently, please wait another **" + hours + " Hours, " + mins + " Minutes, " + sec + " Seconds** to claim another daily crate.");
		message.channel.stopTyping();
		return;
	}

	let streakTime = currTime -  memberInfo.lastCrate;
	if(streakTime < dayCycle)
	{
		memberInfo.dailyStreak++;
		if(memberInfo.dailyStreak >= 5)
		{
			let streakNote = `Streak: ${green_line}${green_line}${green_line}${green_line}${green_line}`;

			memberInfo.dailyStreak = 0;
			message.reply(`you've recieved your **2 free daily crates**, and your **${5 * streakReward} Quarter** streak bonus! Come back again in **24 Hours** to get more.\n\n${streakNote}`);
			memberInfo.crates += 2;
			memberInfo.bal += 5 * streakReward;
		}
		else
		{
			let streakNote = `Streak: `;
			for(let i = 0; i < memberInfo.dailyStreak; i++)
				streakNote += `${green_line}`;
			for(let i = memberInfo.dailyStreak; i < 5; i++)
				streakNote += `${red_line}`;

			message.reply(`you've recieved your **free daily crate**, and your **${memberInfo.dailyStreak * streakReward} Quarter** streak bonus! Come back again in **24 Hours** to get more.\n\n${streakNote}`);
			memberInfo.crates++;
			memberInfo.bal += memberInfo.dailyStreak * streakReward;
		}
	}
	else
	{
		memberInfo.dailyStreak = 0;
		message.reply("you've recieved your **free daily crate!** Come back again in **24 Hours** to get another.");
		memberInfo.crates++;
	}
	memberInfo.lastCrate = currTime + 86400;
	await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
	message.channel.stopTyping();
}
