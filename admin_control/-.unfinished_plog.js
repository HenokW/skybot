/*
===NEEDED TO CHANGE===

- Forgot about the 2,000 Discord char limit. Resort to either:
- Swiping through all the logs w/ reacton emotes
- Use an id / lookup system for offenses
- Look more into dashboards during the freetime / summertime
*/
const Discord = require("discord.js");
const SQLite = require("better-sqlite3");

config = undefined;
//----------
const warnLogChannel = '423255381498920963';
const defaultGuild = '346430947421323267';
//----------

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{//<:warning_emote:559030535540834324>
	this.config = confi;
	cmd = args.shift();

	nextWarnArg = cmd;
	nextWarnArg = nextWarnArg.substring(2, nextWarnArg.length - 1);

	if(nextWarnArg.charAt(0) == "!")
		nextWarnArg = nextWarnArg.substring(1, nextWarnArg.length);

	taggedWarnedUser = await client.fetchUser(nextWarnArg).catch(err =>{});
	if(taggedWarnedUser != undefined)
	{
		message.channel.send(message.author + ", Please check your DMs.");


		//=============SQL===============
	   	//User offenses db
	   	warnOffenseSheet = new SQLite(`./SQL/guild_data/${message.guild.id}/moderation/users/${nextWarnArg}.sqlite`);
	   	client.getUserOffenseData = warnOffenseSheet.prepare("SELECT * FROM data WHERE offense = ?");

	   	//Since we're going to allow users to delete certain warnings / offenses, we should search for a free spot
	   	offenseNum = 1;
	   	resultingMessage = "";
	   	for(_find = 1; _find < 9000; _find++)
	   	{
	      	offendingUser = client.getUserOffenseData.get(_find);
	      	if(offendingUser)
	      	{
	      		warnedByBot = "False";
	      		warnedByUser = "False";

	      		if(offendingUser.botWarning == 1)
	      			warnedByBot = "True";
	      		else
	      			warnedByUser = "True";

	      		resultingMessage = resultingMessage + "**Offense:** `" + _find + "`\n" +
	      											"**Warned by Bot:** `" + warnedByBot + "`\n" +
	      											"**Warned by Staff:** `" + warnedByUser + "`\n" +
	      											"**Reason:** `" + offendingUser.reason + "`\n" + 
	      											"**Staffed By:** `" + offendingUser.staff + "`\n** **\n** **\n";
	      	}
	      	else
	      		break;
	   	}
	   	//===============================
	   	warnOffenseSheet.close();

	   	message.author.send(`__**User log for:**__ <@${nextWarnArg}>\n${resultingMessage}`);
	   	// message.delete();
	   	// message.channel.send(`<:warning_emote:559030535540834324> <@${nextWarnArg}>, has been warned`);
	   	// client.guilds.get(defaultGuild).channels.get(warnLogChannel).send(`<:warning_emote:559030535540834324> <@${nextWarnArg}>, has been warned`); //Warning message
   }
	else
		message.channel.send(message.author + ", you've tagged an invalid user, please try again.");
}