const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

//============================
const isDisabled = false;
const notifier = ['516206994718326795', '148278118170361857']; //We're going to have to send a message to someone to notify them of an admin gifting crates

//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	//If they're not an admin
	if(!message.member.hasPermission("ADMINISTRATOR")) return;

	message.channel.startTyping();

	if(!(isDisabled && guild.id != '346430947421323267'))
		giveCrate(guild, client, message, args);
	else
		message.channel.send("**Removing crates have been temporarily disabled.**");
}

async function giveCrate(guild, client, message, args)
{
	cmd = args.shift();

	nextArg = cmd;
	nextArg = nextArg.substring(2, nextArg.length - 1);

	if(nextArg.charAt(0) == "!")
		nextArg = nextArg.substring(1, nextArg.length);


	taggedUser = await client.fetchUser(nextArg).catch(err =>{});

	amount = args.shift();
	if((taggedUser != undefined) && (amount * 0 == 0) && (amount > 0))
	{
		var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", nextArg);
		memberInfo.crates2 -= Math.floor(amount * 1);

		message.channel.send(message.author + " has successfully removed <@" + nextArg + ">, **" + Math.floor(amount * 1) + " Tier II Crates!**");
		for(_n = 0; _n < notifier.length; _n++)
		{
			let adminProf = message.guild.members.find(member => member.id == notifier[_n]);
			adminProf.send("========================\n" + message.author.username + "#" + message.author.discriminator + " has successfully removed " + taggedUser.username + "#" + taggedUser.discriminator + ", **" + Math.floor(amount * 1) + " Tier II Crates!**\n\n**Guild Name:** " + message.guild.name + "\n**Guild ID:** " + message.guild.id + "\n========================");
		}

		await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
	}

	if(amount < 0)
		message.channel.send(message.author + ", you can't removed negative crates.");

	if(taggedUser == undefined)
		message.channel.send(message.author + ", you've tagged an invalid user, please try again.");
	message.channel.stopTyping();
}
