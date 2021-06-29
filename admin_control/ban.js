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
	currTime = Date();

	nextWarnArg = cmd;
	nextWarnArg = nextWarnArg.substring(2, nextWarnArg.length - 1);

	if(nextWarnArg.charAt(0) == "!")
		nextWarnArg = nextWarnArg.substring(1, nextWarnArg.length);

	taggedWarnedUser = await message.guild.fetchMember(nextWarnArg).catch(err =>{});
	if(taggedWarnedUser != undefined)
	{
		outputReason = "";
		while(cmd != null || cmd != undefined)
		{
			cmd = args.shift();
			if(cmd == undefined)
				break;
			outputReason = outputReason + cmd + " ";
		}

		//=============SQL===============
	   	//Pointer file
	   	warnPFile = new SQLite(`./SQL/guild_data/${message.guild.id}/moderation/pointerFile.sqlite`);
	   	client.getGuildPointerData = warnPFile.prepare("SELECT * FROM data WHERE id = ?");
	   	client.setGuildPointerData = warnPFile.prepare("INSERT OR REPLACE INTO data(id, offenses) VALUES (@id, @offenses);");
	   	let offendingUsersWarnFile = client.getGuildPointerData.get(nextWarnArg);

	   	//User offenses db
	   	warnOffenseSheet = new SQLite(`./SQL/guild_data/${message.guild.id}/moderation/users/${nextWarnArg}.sqlite`);
	   	client.getUserOffenseData = warnOffenseSheet.prepare("SELECT * FROM data WHERE offense = ?");
	   	client.setUserOffenseData = warnOffenseSheet.prepare("INSERT OR REPLACE INTO data(offense, botWarning, userWarning, reason, staff) VALUES (@offense, @botWarning, @userWarning, @reason, @staff);");

	   	//Since we're going to allow users to delete certain warnings / offenses, we should search for a free spot
	   	offenseNum = 1;
	   	for(_find = 0; _find < 9000; _find++)
	   	{
	      	offendingUser = client.getUserOffenseData.get(_find);
	      	if(!offendingUser)
	      	{
	         	offenseNum = _find;
	         	break;
	      	}
	   	}
	   	//===============================

	   	//--
		offendingUsersWarnFile.offenses++;
		//-

		data =
		{
		  offense: offenseNum,
		  botWarning: 0,
		  userWarning: 1,
		  reason: `Kicked by ${message.author.username}\n${outputReason}`,
		  staff: `${message.author.username}#${message.author.discriminator}`
		}

		client.setUserOffenseData.run(data);
		client.setGuildPointerData.run(offendingUsersWarnFile)

	   	warnPFile.close();
	   	warnOffenseSheet.close();

	   	message.delete().catch(err => {console.log("Recieved an error deleting a ban message. Ignorable, but also unknown.");});
	   	taggedWarnedUser.ban({days: 7, reason: outputReason});
	   	message.channel.send(`<:warning_emote:559030535540834324> <@${nextWarnArg}>, has been banned`);
	   	client.guilds.get(defaultGuild).channels.get(warnLogChannel).send(`<:warning_emote:559030535540834324> <@${nextWarnArg}>, has been banned by ${message.author}`); //Warning message
   
	   	generateStaffModerationLogSQLFiles(client, guild, message, taggedWarnedUser, outputReason, currTime);
   }
	else
		message.channel.send(message.author + ", you've tagged an invalid user, please try again.");
}

async function generateStaffModerationLogSQLFiles(client, guild, message, warnedUser, reason, currTime)
{
	staffModerationSQL = new SQLite(`./SQL/guild_data/${guild.id}/moderation/staff/${message.author.id}.sqlite`);
	table = staffModerationSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
	if(!table['count(*)'])
	{
		staffModerationSQL.prepare("CREATE TABLE data (moderationCount INTEGER, user TEXT, reason TEXT, time TEXT);").run();
		staffModerationSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (moderationCount);").run();
		staffModerationSQL.pragma("synchronous = 1");
		staffModerationSQL.pragma("journal_mode = wal");
	}

	//Then we have two prepared atets to get and set the score data
	client.getStaffData = staffModerationSQL.prepare("SELECT * FROM data WHERE moderationCount = ?");
	client.setStaffData = staffModerationSQL.prepare("INSERT OR REPLACE INTO data(moderationCount, user, reason, time) VALUES (@moderationCount, @user, @reason, @time);");

	let modData = client.getStaffData.get(0);
	if(!modData)
	{
		data =
		{
			moderationCount: 0,
			user: `${warnedUser.username}#${warnedUser.discriminator}`,
			reason: reason,
			time: currTime
		}
		
	}
	else
	{
		modNum = 1;
	   	for(_mFind = 0; _mFind < 9000; _mFind++) //Finding a free spot
	   	{
	      	modNum = client.getStaffData.get(_mFind);
	      	if(!modNum)
	      	{
	         	modNum = _mFind;
	         	break;
	      	}
	   	}
	   	//===============================

	   	//--
	  	data =
		{
			moderationCount: modNum,
			user: warnedUser,
			reason: reason,
			time: currTime
		}
	}
	client.setStaffData.run(data);
	staffModerationSQL.close();
}