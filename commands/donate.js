const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

//============================
const isDisabled = false; //Disable / Enable crate giving
const notifier = ['516206994718326795', '148278118170361857']; //We're going to have to send a message to a selected bunch to notify them of an admin/someone gifting quarters

//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	//If they're not an admin
	if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id != '148278118170361857') return;

	message.channel.startTyping();

	//We can choose whether or not to disable crate giving, along with other crate stuff in their
	//respected files
	if(!isDisabled)
		giveBal(guild, client, message, args);
	else
		message.channel.send("**Giving crates have been temporarily disabled.**");
}

//The main crate giving method
async function giveBal(guild, client, message, args)
{
	cmd = args.shift();

	//Start to check whether or not the next arg is a valid Discord user
	nextArg = cmd;
	nextArg = nextArg.substring(2, nextArg.length - 1);

	if(nextArg.charAt(0) == "!")
		nextArg = nextArg.substring(1, nextArg.length);

		//
	taggedUser = await client.fetchUser(nextArg).catch(err =>{});

	//Main body
	amount = args.shift();
	if((taggedUser != undefined) && (amount * 0 == 0) && (amount > 0))
	{
		var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

		memberInfo.bal += Math.floor(amount * 1);
		memberInfo.totalBal += Math.floor(amount * 1);

		message.channel.send(message.author + " has successfully given <@" + nextArg + ">, **" + Math.floor(amount * 1) + " Quarters!**");
		for(_n = 0; _n < notifier.length; _n++)
		{
			let adminProf = message.guild.members.find(member => member.id == notifier[_n]);
			if(adminProf == null || adminProf == undefined) continue;
			adminProf.send("========================\n" + message.author.username + "#" + message.author.discriminator + " has successfully given " + taggedUser.username + "#" + taggedUser.discriminator + ", **" + Math.floor(amount * 1) + " Quarters!**\n\n**Guild Name:** " + message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n========================");
		}

		await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
	}

	if(amount < 0)
		message.channel.send(message.author + ", you can't give negative quarters.");

	if(taggedUser == undefined)
		message.channel.send(message.author + ", you've tagged an invalid user, please try again.");
	message.channel.stopTyping();
}
