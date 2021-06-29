/*
----------
AUTHOR: Henok Wondasan
DEVELOPED FOR: T.O.G. Network / Discord Server
----------

== NEEDED TO ADD ==
- Music Bot ( DONE )
- Music Bot commands added to help list
- Giveaway bot (maybe?)
- VC EXP gain
- A new gambling gamemode (maybe?)
*/
const Discord = require("discord.js");
const config = require("./config.json");
const SQLite = require("better-sqlite3");
const antispam = require('discord-anti-spam');
const colors = require('colors');
const achieveHand = require('./commands/utils/achievements.js');
const sqlHand = require("./commands/utils/sql_handler.js");
const spamCheck = require("./commands/utils/anti-spam.js");
const fs = require("fs");

const client = new Discord.Client();

//--- Random Variables
const staffAccessCommands = ["Owner", "Admin", "Mod", "Chat Mod"]; //Chat Mod, Mod, Admin
const RPG_bot_id = '554735484618801162';

const bot_cmd_channel = '542055821995933706';
const suggestionsChannel = '552021950122164225';

const displayUserCount = false;
const msgLevelDelay = 60; //Time in seconds / 1000 = milliseconds
//-----
const isAchievementEarningDisabled = false;
const adminControlDisabled = false;

// client.commands = new Discord.Collection();
fs.readdir("./commands/", (err, files) =>
{
	if(err)
		client.emit("error", err);

	let jsfile = files.filter(f => f.split(".").pop() === "js");
	if(jsfile.length <= 0)
	{//
		console.log("Unable to find commands.");
		return;
	}

	console.log("\n==== COMMANDS ====");
	console.log(`${jsfile.length} commands found`);
	console.log("==================\n");
	jsfile.forEach((f, i) => { let props = require(`./commands/${f}`); });
});

client.on("guildMemberAdd", async member =>
{
	let eventSettingJoin = await sqlHand.getData(client, `./SQL/guild_data/${member.guild.id}/${member.guild.id}.sqlite`, "data", "guild", member.guild.id);
	if(eventSettingJoin.settingUserJoin == 1)
	{
		let joinedMemberEvent = require('./events/guildMemberAdd.js');
		joinedMemberEvent.main(client, member);
	}

	let myGuildsList = client.guilds.array();
	generateMissingGuildMemberSQLData(myGuildsList);
});

client.on('guildMemberRemove', async member =>
{
	default_log = '555824593726603265';

	eventSettingLeave = await sqlHand.getData(client, `./SQL/guild_data/${member.guild.id}/${member.guild.id}.sqlite`, "data", "guild", member.guild.id);
	if(eventSettingLeave.settingUserLeave == 1)
	{
		let removedMemberEvent = require('./events/guildMemberRemove.js');
		removedMemberEvent.main(client, member);
	}
})

client.on('messageDelete', async message =>
{
	if(message.channel.type == "dm") return;

	default_log = '555824593726603265';

	eventMsgDel = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, "data", "guild", message.guild.id);
	if(eventMsgDel.settingDeleteMessage == 1 && message.guild.id == '541420301049790464')
	{
		let logs = await message.guild.fetchAuditLogs({type: 72});
		let entry = logs.entries.first();

		const removedMessage = new Discord.RichEmbed()
			.setColor("#98002E")
			.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
			.setDescription(`**Message deleted by ${entry.executor} in ${message.channel}**\n${message.content}`)
			.setFooter(`Message ID: ${message.id}`)
			.setTimestamp();

		client.channels.get(default_log).send({embed:removedMessage});
	}
})

client.on('messageUpdate', async (oldMessage, newMessage) =>
{
	if(oldMessage.channel.type == "dm") return;

	try
	{
		default_log = '555824593726603265';

		eventMsgUp = await sqlHand.getData(client, `./SQL/guild_data/${newMessage.guild.id}/${newMessage.guild.id}.sqlite`, "data", "guild", newMessage.guild.id);
		if(eventMsgUp.settingEditMessage == 1 && newMessage.guild.id == '541420301049790464' && !oldMessage.author.bot)
		{
			const updatedMessage = new Discord.RichEmbed()
				.setColor("#1D69D2")
				.setDescription(`**Message edited in ${message.channel}**`)
				.setAuthor(`${oldMessage.author.username}#${oldMessage.author.discriminator}`, oldMessage.author.displayAvatarURL)
				.addField("Old message", oldMessage.content)
				.addField("New Message", newMessage.content)
				.setFooter(`Message ID: ${oldMessage.id}`)
				.setTimestamp();

			client.channels.get(default_log).send({embed:updatedMessage});
		}
	}
	catch(e){}
})

client.on("ready", async () =>
{
	let myGuildsList = client.guilds.array();
	console.log("> I'm now ONLINE!".bold.green);

	// client.user.setAvatar('./resources/botpic.png');
	//Whether or not to display user count, or the "@BOT_NAME for help" message

	if(!displayUserCount)
		client.user.setActivity("@" + client.user.username + " for help");
	else
		totalGuildPlayers();

	if(!adminControlDisabled)
	{
		spamCheck(client);
		// antispam(client, {
	    //     warnBuffer: 4, // Maximum ammount of messages allowed to send in the interval time before getting warned.
	    //     maxBuffer: 7, // Maximum amount of messages allowed to send in the interval time before getting banned.
	    //     interval: 3500, // Amount of time in ms users can send the maxim amount of messages(maxBuffer) before getting banned.
	    //     warningMessage: "please stop spamming.", // Message users receive when warned. (message starts with '@User, ' so you only need to input continue of it.)
	    //     banMessage: "has been hit with the ban hammer for spamming!", // Message sent in chat when user is banned. (message starts with '@User, ' so you only need to input continue of it.)
	    //     maxDuplicatesWarning: 7,// Maximum amount of duplicate messages a user can send in a timespan before getting warned.
	    //     maxDuplicatesBan: 10, // Maximum amount of duplicate messages a user can send in a timespan before getting banned.
	    //     deleteMessagesAfterBanForPastDays: 7, // Deletes the message history of the banned user in x days.
	    //     exemptRoles: ["YoYo"], // Name of roles (case sensitive) that are exempt from spam filter.
	    //     exemptUsers: ["StupidEdits#4461", "Hello I'm Sky#7987"], // The Discord tags of the users (e.g: MrAugu#9016) (case sensitive) that are exempt from spam filter.
	    //    	exemptChannels: ["542055821995933706"],
	    //    	exemptGuilds: ["346430947421323267"]
	    //   });
	}

	//Generating SQL data
	generateMissingSQLFiles();
	// generateMissingGuildMemberSQLData(myGuildsList);
	// generateMissingPlayerSQLData();

	//Message Manager
	let msgMan = require("./commands/utils/message_manager.js");
	let actMan = require("./commands/utils/action_manager.js");
	actMan.startup(client);
	msgMan.startup(client);
});

client.on("guildCreate", async guild =>
{
	console.log("I've been connected to a new guild: " + guild.id);
	const newGuildSQL = new SQLite(`./SQL/guild_data/${guild.id}.sqlite`);
	const newGuildTable = newGuildSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
	if(!newGuildTable['count(*)'])
	{
		await generateMissingSQLFiles();
		// await generateGuildFiles(newGuildSQL, guild);
		// await generateMissingGuildMemberSQLData(guild);
	}

	newGuildSQL.close();
});

client.on("error", async (e) =>
{
	var err_chan = await client.guilds.get('346430947421323267').channels.get('589556167529857038');

	err_chan.send(`**== Incoming Error ==**\n${e}\n** **`);
	console.error(e);
});

// process.on('uncaughtException', function (exception) {
//   console.log(exception); // to see your exception details in the console
//   // if you are on production, maybe you can send the exception details to your
//   // email as well ?
// });
//
// process.on('warning', (warning) => {
//   console.warn(warning.name);    // Print the warning name
//   console.warn(warning.message); // Print the warning message
//   console.warn(warning.stack);   // Print the stack trace
// });
//
// process.on('unhandledRejection', (reason, promise) => {
//   console.log('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Application specific logging, throwing an error, or other logic here
// });

client.on("warn", (e) => console.warn(e));
// client.on("debug", (e) => console.info(e));

client.on("message", async message =>
{
	if(message.channel.type === "dm" && message.author.id != client.user.id)
	{
		let guilds = client.guilds.find('id', '346430947421323267');
		let henok = guilds.members.find(member => member.id == 148278118170361857);
		henok.send(`From: ${message.author.username}#${message.author.discriminator}\n\n${message.content}`);
	}

	if(message.channel.type === "dm") return;
	if(message.author.id == client.user.id) return;
	if(message.channel.id == '541845655170056209') return;
	//if(message.author.id != '148278118170361857') return message.reply("the bot is currently updating.");

	client.emit("spamMessageCheck", message);
	if(!message.author.bot && !adminControlDisabled && message.guild.id != '346430947421323267')
	{
		let moderationFile = require(`./admin_control/main.js`);
		tempArgs = message.content.trim().split(' ');
		moderationFile.run(client, message, tempArgs, config);
	}

	if(message.guild.id === '554737777049206794')
	{
		if((message.author.id == RPG_bot_id || message.author.id == '148278118170361857' || message.author.id == '472444723509067776'  || message.author.id == '554735484618801162') && message.content.startsWith("tog.get") || message.content.startsWith("tog.set") || message.content.startsWith("tog.cb") || message.content.startsWith("tog.subbal") || message.content.startsWith("tog.addbal"))
		{
			let args = message.content.slice(4).trim().split(' ');
			let botRequest = require(`./commands/utils/main.js`);
			botRequest.run(client, message, args, config);
		}
	}

	if(message.author.bot) return;
	//-----ACHIVEMENTS CHECK HERE-----
	if(!isAchievementEarningDisabled)
		achieveHand.main(client, message);
	// ----------


	//Grabs the prefix for the guild our command was sent
	var guildData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, "data", "guild", message.guild.id);

	var currentGuildCMD = message.guild.id;
	var args = message.content.slice(guildData.prefix.length).trim().split(' ');
	var cmd = args.shift().toLowerCase();

	if(message.guild.id == '541420301049790464' && !message.author.bot)
		checkUserLevel(message);

	try
	{
		//If they happened to ping the bot
		if(message.content == (client.user))
			message.channel.send("For further help, please feel free to use **`" + guildData.prefix + "help`** for a complete rundown of all my commands.\n\n**Guild prefix:** `" + guildData.prefix + "`");

		//If the message sent in a guild doesn't match their guilds prefix
		if(!message.content.startsWith(guildData.prefix) && !message.content.toLowerCase().startsWith(guildData.prefix) && !message.content.toUpperCase().startsWith(guildData.prefix))
		{
			suggestionsMessageCheck(client, message);
			userMessageSent(message, guildData.prefix);
			return;
		}

		guildDate_dir = (`./SQL/guild_data/${message.guild.id}`);
		try
		{
			if((adminControlDisabled) && (cmd == "words" || cmd == "kick" || cmd == "ban" || cmd == "warn" || cmd == "plog") && (message.author.id == "148278118170361857" || message.member.roles.some(r => staffAccessCommands.includes(r.name))))
			{
				let adminCmdFile = require(`./admin_control/${cmd}.js`);
				adminCmdFile.run(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
			}
			else if(cmd == "skip" || cmd == "leave" || cmd == "queue" || cmd == "pause" || cmd == "remove") //Music bot commands
			{
				let musicFile = require(`./commands/play.js`);
				switch(cmd)
				{
					case "skip":
						musicFile.skip(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
						break;
					case "leave":
						musicFile.leave(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
						break;
					case "queue":
						musicFile.musicQueue(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
						break;
					case "pause":
						musicFile.pause(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
						break;
					case "remove":
						musicFile.remove(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
						break;
				}
			}
			else if((message.channel.id == bot_cmd_channel || message.channel.id == '556192151655022637' || message.guild.id != '541420301049790464'))
			{
				let commandFile = require(`./commands/${cmd}.js`);
				commandFile.run(message.guild, client, message, args, guildData.prefix, guildDate_dir, config);
			}
		}
		catch(e)
		{
			// client.emit("error", "Ignorable error >> Invalid command used.");
			// client.emit("error", e);
		}

		//Waits to make sure a valid commandFile was passed

		//Increment the guild command usage count
		var usage_count = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, "data", "guild", message.guild.id);
		usage_count.commands_used++;
		await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/${message.guild.id}.sqlite`, config.guildSettingsSQLSetter, usage_count);


		//The main method that works user stuff
		//Levels, messages and/or commands sent etc..
		userMessageSent(message, guildData.prefix);
	} catch(e) { client.emit("error", e); }
});

async function generateMissingSQLFiles()
{
	let myGuildsList = client.guilds.array();

	for(i = 0; i < myGuildsList.length; i++)
	{
		guildID = myGuildsList[i];

		guildSQL = null;
		try
		{
			//Checks to make sure every guild has their own folders & files
			guildSQL = new SQLite(`./SQL/guild_data/${guildID.id}/${guildID.id}.sqlite`);
			// mkdirCheckGuildSQL = new SQLite(`./SQL/guild_data/${guildID.id}/moderation/moderationInfo.sqlite`);
		}
		catch(e)
		{
			//If not, then create the dir first
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/members`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/games`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/games/users`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/moderation`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/moderation/users`, (err) => {
			  if (err) throw err;
			});
			fs.mkdirSync(`./SQL/guild_data/${guildID.id}/moderation/staff`, (err) => {
			  if (err) throw err;
			});

			guildSQL = new SQLite(`./SQL/guild_data/${guildID.id}/${guildID.id}.sqlite`);
		}

		//Create the files last
		const table = guildSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
		if(!table['count(*)'])
			await generateGuildFiles(guildSQL, guildID);

		guildSQL.close();
	}
	generateMissingGuildMemberSQLData(myGuildsList);
}

async function generateGuildFiles(guildSQL, guild)
{
	//If it's not there, create it & the db
	guildSQL.prepare("CREATE TABLE data (guild TEXT, prefix TEXT, safe INTEGER, taxEnabled INTEGER, tax INTEGER, log_channel TEXT, commands_used INTEGER, settingUserJoin INTEGER, settingUserLeave INTEGER, settingEditMessage INTEGER, settingDeleteMessage INTEGER);").run();
	guildSQL.prepare("CREATE UNIQUE INDEX idx_data_id ON data (guild);").run();
	guildSQL.pragma("synchronous = 1");
	guildSQL.pragma("journal_mode = wal");

	//Then we have two prepared atets to get and set the score data
	//client.getGuild = sql.prepare("SELECT * FROM data WHERE prefix = ? AND commands_used = ?");
	client.setData = guildSQL.prepare("INSERT OR REPLACE INTO data(guild, prefix, safe, taxEnabled, tax, log_channel, commands_used, settingUserJoin, settingUserLeave, settingEditMessage, settingDeleteMessage) VALUES (@guild, @prefix, @safe, @taxEnabled, @tax, @log_channel, @commands_used, @settingUserJoin, @settingUserLeave, @settingEditMessage, @settingDeleteMessage);");

	// if(!score)
	// {
		data =
		{
			guild: `${guildID.id}`,
			prefix: config.prefix,
			safe: 0,
			taxEnabled: 0,
			tax: 0,
			log_channel: null,
			commands_used: 0,
			settingUserJoin: 0,
			settingUserLeave: 0,
			settingEditMessage: 0,
			settingDeleteMessage: 0
		}
		client.setData.run(data);
	// }
	guildSQL.close();
	console.log("Generated missing file");
}

async function generateMissingPlayerSQLData()
{
	//their Discord ID, on-hand balance, vault balance, level, current exp,
	//===============SEPERATE PLAYER DATA!===============//
	//Global: Discord ID, on-hand balance, vault balance
	//Server specific: level, current exp
	//------Nevermind lol------//

	const playerSQL = new SQLite(`./SQL/player_data/player_data.sqlite`);
	const table = playerSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
	if(!table['count(*)'])
	{
		playerSQL.prepare("CREATE TABLE data (id TEXT, bal INTEGER, vault INTEGER);").run();
		playerSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
		playerSQL.pragma("synchronous = 1");
		playerSQL.pragma("journal_mode = wal");

		console.log("Generated missing global player data file");
	}
	playerSQL.close();
}

async function generateMissingGuildMemberSQLData(guild)
{
	created = 0;

	console.log("====GUILD USER DATA NOTICE====\nStarted to check & create guild member data, I will let you know when I'm done.");
	for(_gd = 0; _gd < guild.length; _gd++)
	{
		for(_u = 0; _u < guild[_gd].members.array().length; _u++)
		{
			// playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/${guild[_gd].members.array()[_u].id}.sqlite`);
			playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/member_data.sqlite`);
			table = playerSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
			if(!table['count(*)'])
			{
				playerSQL.prepare("CREATE TABLE data (id TEXT, level INTEGER, exp INTEGER, bal INTEGER, totalBal INTEGER, balMultiplierTimer INTEGER, lastDailyBal INTEGER, vault INTEGER, crates INTEGER, crates2 INTEGER, crates3 INTEGER, openedCrates INTEGER, lastCrate INTEGER, caps INTEGER, caps2 INTEGER, caps3 INTEGER, openedCaps INTEGER, lastCap INTEGER, lastMsg INTEGER, lastWeekly INTEGER, messages_sent INTEGER, commands_used INTEGER, dailyStreak INTEGER);").run();
				playerSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
				playerSQL.pragma("synchronous = 1");
				playerSQL.pragma("journal_mode = wal");
			}

			//Then we have two prepared atets to get and set the score data
			client.getData = playerSQL.prepare("SELECT * FROM data WHERE id = ?"); //openedCrates,
			client.setData = playerSQL.prepare(config.usersSQLSetter);

			let playerID = client.getData.get(guild[_gd].members.array()[_u].id);
			if(!playerID)
			{
				data =
				{
					id: `${guild[_gd].members.array()[_u].id}`,
					level: 1,
					exp: 0,
					bal: 0,
					totalBal: 0,
					balMultiplierTimer: 0,
					lastDailyBal: 0,
					vault: 0,
					crates: 0,
					crates2: 0,
					crates3: 0,
					openedCrates: 0,
					lastCrate: 0,
					caps: 0,
					caps2: 0,
					caps3: 0,
					openedCaps: 0,
					lastCap: 0,
					lastMsg: 0,
					lastWeekly: 0,
					messages_sent: 0,
					commands_used: 0,
					dailyStreak: 0
				}
				created++;
				client.setData.run(data);
			}
			playerSQL.close();
		}
	}
	console.log("Created: " + created + " member users. >> Onto profile stuff");
	await generateMissingMemberProfileData(guild);
}

async function generateMissingMemberProfileData(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		for(_u = 0; _u < guild[_gd].members.array().length; _u++)
		{
			// playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/${guild[_gd].members.array()[_u].id}.sqlite`);
			playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/member_profile_data.sqlite`);
			table = playerSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
			if(!table['count(*)'])
			{
				playerSQL.prepare("CREATE TABLE data (id TEXT, currentBG INTEGER, totalBG INTEGER, bg1 INTEGER, bg2 INTEGER, bg3 INTEGER, bg4 INTEGER, bg5 INTEGER, bg6 INTEGER, bg7 INTEGER, bg8 INTEGER, bg9 INTEGER, bg10 INTEGER, bg11 INTEGER, bg12 INTEGER, bg13 INTEGER, bg14 INTEGER, bg15 INTEGER, bg16 INTEGER, bg17 INTEGER, bg18 INTEGER, bg19 INTEGER, bg20 INTEGER, bg21 INTEGER, bg22 INTEGER, bg23 INTEGER, bg24 INTEGER, bg25 INTEGER, bg26 INTEGER);").run();
				playerSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
				playerSQL.pragma("synchronous = 1");
				playerSQL.pragma("journal_mode = wal");
			}

			//Then we have two prepared atets to get and set the score data
			client.getData = playerSQL.prepare("SELECT * FROM data WHERE id = ?");
			client.setData = playerSQL.prepare("INSERT OR REPLACE INTO data(id, currentBG, totalBG, bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11, bg12, bg13, bg14, bg15, bg16, bg17, bg18, bg19, bg20, bg21, bg22, bg23, bg24, bg25, bg26) VALUES (@id, @currentBG, @totalBG, @bg1, @bg2, @bg3, @bg4, @bg5, @bg6, @bg7, @bg8, @bg9, @bg10, @bg11, @bg12, @bg13, @bg14, @bg15, @bg16, @bg17, @bg18, @bg19, @bg20, @bg21, @bg22, @bg23, @bg24, @bg25, @bg26);");

			let playerBGs = client.getData.get(guild[_gd].members.array()[_u].id);
			if(!playerBGs)
			{
				data =
				{
					id: `${guild[_gd].members.array()[_u].id}`,
					currentBG: 0,
					totalBG: 1,
					bg1: 1,
					bg2: 0,
					bg3: 0,
					bg4: 0,
					bg5: 0,
					bg6: 0,
					bg7: 0,
					bg8: 0,
					bg9: 0,
					bg10: 0,
					bg11: 0,
					bg12: 0,
					bg13: 0,
					bg14: 0,
					bg15: 0,
					bg16: 0,
					bg17: 0,
					bg18: 0,
					bg19: 0,
					bg20: 0,
					bg21: 0,
					bg22: 0,
					bg23: 0,
					bg24: 0,
					bg25: 0,
					bg26: 0
				}
				created++;
				client.setData.run(data);
			}
			playerSQL.close();
		}
	}
	console.log("Created: " + created + " Profile BG users. >> Onto Achievement stuff");
	await generateMissingMemberAchievemntsData(guild);
}

async function generateMissingMemberAchievemntsData(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		for(_u = 0; _u < guild[_gd].members.array().length; _u++)
		{
			// playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/${guild[_gd].members.array()[_u].id}.sqlite`);
			playerSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/members/member_achievement_data.sqlite`);
			table = playerSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
			if(!table['count(*)'])
			{
				playerSQL.prepare("CREATE TABLE data (id TEXT, totalAch INTEGER, slot1 INTEGER, slot2 INTEGER, slot3 INTEGER, slot4 INTEGER, slot5 INTEGER, slot6 INTEGER, slot7 INTEGER, ac1 INTEGER, ac2 INTEGER, ac3 INTEGER, ac4 INTEGER, ac5 INTEGER, ac6 INTEGER, ac7 INTEGER, ac8 INTEGER, ac9 INTEGER);").run();
				playerSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
				playerSQL.pragma("synchronous = 1");
				playerSQL.pragma("journal_mode = wal");
			}

			//Then we have two prepared atets to get and set the score data
			client.getData = playerSQL.prepare("SELECT * FROM data WHERE id = ?");
			client.setData = playerSQL.prepare("INSERT OR REPLACE INTO data(id, totalAch, slot1, slot2, slot3, slot4, slot5, slot6, slot7, ac1, ac2, ac3, ac4, ac5, ac6, ac7, ac8, ac9) VALUES (@id, @totalAch, @slot1, @slot2, @slot3, @slot4, @slot5, @slot6, @slot7, @ac1, @ac2, @ac3, @ac4, @ac5, @ac6, @ac7, @ac8, @ac9);");

			let playerAch = client.getData.get(guild[_gd].members.array()[_u].id);
			if(!playerAch)
			{
				data =
				{
					id: `${guild[_gd].members.array()[_u].id}`,
					totalAch: 0,
					slot1: 0,
					slot2: 0,
					slot3: 0,
					slot4: 0,
					slot5: 0,
					slot6: 0,
					slot7: 0,
					ac1: 0,
					ac2: 0,
					ac3: 0,
					ac4: 0,
					ac5: 0,
					ac6: 0,
					ac7: 0,
					ac8: 0,
					ac9: 0
				}
				created++;
				client.setData.run(data);
			}
			playerSQL.close();
		}
	}
	console.log("Created: " + created + " Achievement users. >> Onto Casino stuff");
	await generateSlotsSQLFiles(guild);
}

async function generateSlotsSQLFiles(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		casinoSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/games/casino.sqlite`);
		table = casinoSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
		if(!table['count(*)'])
		{
			casinoSQL.prepare("CREATE TABLE data (id TEXT, bank INTEGER, losses INTEGER);").run();
			casinoSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
			casinoSQL.pragma("synchronous = 1");
			casinoSQL.pragma("journal_mode = wal");
		}

		//Then we have two prepared atets to get and set the score data
		client.getData = casinoSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setData = casinoSQL.prepare("INSERT OR REPLACE INTO data(id, bank, losses) VALUES (@id, @bank, @losses);");

		let casinoData = client.getData.get(guild[_gd].id);
		if(!casinoData)
		{
			data =
			{
				id: `${guild[_gd].id}`,
				bank: 0,
				losses: 0
			}
			created++;
			client.setData.run(data);
		}
		casinoSQL.close();
	}
	console.log("Created: " + created + " Casinos >> Onto Games Files stuff");
	await generateGamesProfileSQLFiles(guild);
}

async function generateGamesProfileSQLFiles(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		gamesSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/games/users/gamesStats.sqlite`);
		table = gamesSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
		if(!table['count(*)'])
		{
			gamesSQL.prepare("CREATE TABLE data (id TEXT, slotsW INTEGER, slotsL INTEGER, slotsBalGain INTEGER, slotsBalLost INTEGER, slotsFaceMatch INTEGER, slotsEggMatch INTEGER, slotsCherryMatch INTEGER, slotsStarMatch INTEGER, gambleW INTEGER, gambleL INTEGER, gambleBalGain INTEGER, gambleBalLost INTEGER, raceW INTEGER, raceL INTEGER, typeraceW INTEGER, hlStreak INTEGER);").run();
			gamesSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
			gamesSQL.pragma("synchronous = 1");
			gamesSQL.pragma("journal_mode = wal");
		}

		//Then we have two prepared atets to get and set the score data
		client.getData = gamesSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setData = gamesSQL.prepare("INSERT OR REPLACE INTO data(id, slotsW, slotsL, slotsBalGain, slotsBalLost, slotsFaceMatch, slotsEggMatch, slotsCherryMatch, slotsStarMatch, gambleW, gambleL, gambleBalGain, gambleBalLost, raceW, raceL, typeraceW, hlStreak) VALUES (@id, @slotsW, @slotsL, @slotsBalGain, @slotsBalLost, @slotsFaceMatch, @slotsEggMatch, @slotsCherryMatch, @slotsStarMatch, @gambleW, @gambleL, @gambleBalGain, @gambleBalLost, @raceW, @raceL, @typeraceW, @hlStreak);");

		for(_ss = 0; _ss < guild[_gd].members.array().length; _ss++)
		{
			let statsSheet = client.getData.get(guild[_gd].members.array()[_ss].id);
			if(!statsSheet)
			{
				data =
				{
					id: `${guild[_gd].members.array()[_ss].id}`,
					slotsW: 0,
					slotsL: 0,
					slotsBalGain: 0,
					slotsBalLost: 0,
					slotsFaceMatch: 0,
					slotsEggMatch: 0,
					slotsCherryMatch: 0,
					slotsStarMatch: 0,
					gambleW: 0,
					gambleL: 0,
					gambleBalGain: 0,
					gambleBalLost: 0,
					raceW: 0,
					raceL: 0,
					typeraceW: 0,
					hlStreak: 0
				}
				created++;
				client.setData.run(data);
			}
		}
		gamesSQL.close();
	}
	console.log("Created: " + created + " Games Profiles >> Onto Pointer Files stuff");
	await generateModerationPointerSQLFiles(guild);
}

async function generateModerationPointerSQLFiles(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		pointerFile = new SQLite(`./SQL/guild_data/${guild[_gd].id}/moderation/pointerFile.sqlite`);
		table = pointerFile.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
		if(!table['count(*)'])
		{
			pointerFile.prepare("CREATE TABLE data (id TEXT, offenses INTEGER);").run();
			pointerFile.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
			pointerFile.pragma("synchronous = 1");
			pointerFile.pragma("journal_mode = wal");
		}

		for(_pfu = 0; _pfu < guild[_gd].members.array().length; _pfu++)
		{
			//Then we have two prepared atets to get and set the score data
			client.getData = pointerFile.prepare("SELECT * FROM data WHERE id = ?");
			client.setData = pointerFile.prepare("INSERT OR REPLACE INTO data(id, offenses) VALUES (@id, @offenses);");

			let pointFileUser = client.getData.get(guild[_gd].members.array()[_pfu].id);
			if(!pointFileUser)
			{
				data =
				{
					id: `${guild[_gd].members.array()[_pfu].id}`,
					offenses: 0
				}
				created++;
				client.setData.run(data);
			}
		}
		pointerFile.close();
	}
	console.log("Created: " + created + " Pointer file users >> Onto moderation stuff");
	await generateModerationSQLFiles(guild);
}

async function generateModerationSQLFiles(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		for(_gm = 0; _gm < guild[_gd].members.array().length; _gm++)
		{
			usersModerationSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/moderation/users/${guild[_gd].members.array()[_gm].id}.sqlite`);
			table = usersModerationSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
			if(!table['count(*)'])
			{
				usersModerationSQL.prepare("CREATE TABLE data (offense INTEGER, botWarning INTEGER, userWarning INTEGER, reason TEXT, staff TEXT);").run();
				usersModerationSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (offense);").run();
				usersModerationSQL.pragma("synchronous = 1");
				usersModerationSQL.pragma("journal_mode = wal");
			}

			//Then we have two prepared atets to get and set the score data
			client.getData = usersModerationSQL.prepare("SELECT * FROM data WHERE offense = ?");
			client.setData = usersModerationSQL.prepare("INSERT OR REPLACE INTO data(offense, botWarning, userWarning, reason, staff) VALUES (@offense, @botWarning, @userWarning, @reason, @staff);");

			let userModData = client.getData.get(0);
			if(!userModData)
			{
				data =
				{
					offense: 0,
					botWarning: 0,
					userWarning: 0,
					reason: "",
					staff: ""
				}
				created++;
				client.setData.run(data);
			}
			usersModerationSQL.close();
		}
	}
	console.log("Created: " + created + " files for Moderation >> Onto channel settings stuff");
	await generateChannelSettingsSQL(guild);
	//await generateStaffModerationLogSQLFiles(guild);
}

async function generateChannelSettingsSQL(guild)
{
	created = 0;

	for(_gd = 0; _gd < guild.length; _gd++)
	{
		for(_gm = 0; _gm < guild[_gd].members.array().length; _gm++)
		{
			guildChannelsSQL = new SQLite(`./SQL/guild_data/${guild[_gd].id}/channel_settings.sqlite`);
			table = guildChannelsSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
			if(!table['count(*)'])
			{
				guildChannelsSQL.prepare("CREATE TABLE data (id TEXT, suggestions_channel TEXT, welcome_channel TEXT, mod_log_channel TEXT, music_channel TEXT, joined_message TEXT, polls_channel TEXT, leave_channel TEXT, leave_message TEXT, events_channel TEXT);").run();
				guildChannelsSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
				guildChannelsSQL.pragma("synchronous = 1");
				guildChannelsSQL.pragma("journal_mode = wal");
			}

			//Then we have two prepared atets to get and set the score data
			client.getData = guildChannelsSQL.prepare("SELECT * FROM data WHERE id = ?");
		    client.setData = guildChannelsSQL.prepare(config.setChannelSettings);

			let guildSettings = client.getData.get(guild[_gd].id);
			if(!guildSettings)
			{
				data =
		        {
		            id: `${guild[_gd].id}`,
		            suggestions_channel: null,
		            welcome_channel: null,
		            mod_log_channel: null,
		            music_channel: null,
					joined_message: config.default_welcome_message,
					polls_channel: null,
					leave_channel: null,
					leave_message: config.default_leave_message,
					events_channel: null
		        }
				created++;
				client.setData.run(data);
			}
			guildChannelsSQL.close();
		}
	}
	console.log("Created: " + created + " files for Server Channel Settings.\n=====GUILD USER DATA END NOTICE=====");
}

async function checkUserLevel(message)
{
	const memberSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);

	client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");

	let memberInfo = client.getMemberData.get(message.author.id);

	//-----

	if(message.guild.id == '541420301049790464')
	{
		let senderProf = message.guild.members.find(member => member.id == message.author.id);
		lvl5_role = message.guild.roles.find(role => role.id == '553761995560714250');
		lvl15_role = message.guild.roles.find(role => role.id == '553761994717790219');

		if(!(senderProf.roles.has(lvl5_role.id)) && (memberInfo.level >= 5))
		{
			senderProf.addRole(lvl5_role);
			message.channel.send(message.author + " has been awarded the **The Level 5 Role!**");
			message.author.send("Congrats on achieving **Level 5 Color Role** within the **" + message.guild.name + "** Server!\n\n This comes with the ability to modify the color of your name. To do this, head to " +
																																																						"<#542055821995933706>, and use the command: `-role` to get a general idea of what you're able to use.");
		}

		if(!(senderProf.roles.has(lvl15_role.id)) && (memberInfo.level >= 15))
		{
			senderProf.addRole(lvl15_role);
			message.channel.send(message.author + " has been awarded the **The Level 15 Role!**");
		}
	}
	memberSQL.close();
}

async function userMessageSent(message, guildPrefix)
{
	if(message.channel == '541845655170056209') return;

	var isCommand = false;

	guildID = message.guild.id;
	userID = message.author.id;
	if(message.content.startsWith(guildPrefix))
		isCommand = true;

	var guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${guildID}/${guildID}.sqlite`, "data", "guild", guildID);
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guildID}/members/member_data.sqlite`, "data", "id", userID);

	//Increase
	memberInfo.messages_sent++;
	if(isCommand)
		memberInfo.commands_used++;

	//Level stuff
	//-------------------------------------------------------
	let balGain_per_level = 50;
	let initalLevelEXP = config.initial_exp;
	let expGain_min = config.expGain_min;
	let expGain_max = config.expGain_max;

	//msgLevelDelay
	currTime = Math.round((new Date()).getTime() / 1000);
	if(currTime >= memberInfo.lastMsg)
	{
		//Random number from expGain_min to expGain_max
		xp = Math.floor(Math.random() * (expGain_max - expGain_min)) + expGain_min;
		newXP = memberInfo.exp + xp;

		//Find the users exp needed to level up
		currLevelXPNeeded = 5 * (memberInfo.level * memberInfo.level) - 5 * memberInfo.level + initalLevelEXP;
		if(newXP >= currLevelXPNeeded)
		{
			//Carryover any xp over the required level
			newXP = Math.abs(currLevelXPNeeded - newXP);
			memberInfo.crates++;
			memberInfo.level++;

			balMulti = false;
			if(memberInfo.balMultiplierTimer > currTime)
			{
				balMulti = true;
				memberInfo.bal += balGain_per_level * 2;
			}
			else
				memberInfo.bal += balGain_per_level;

			t2 = false;
			t2CrateChance = Math.floor(Math.random() * 10) + 1;
			if(t2CrateChance == 1)
			{
				memberInfo.crates--;
				memberInfo.crates2++;
				t2 = true;
			}

			if(message.guild.id != '545006544790749194')
			{
				var leveled_icon = require("./commands/utils/leveled_user.js");
				leveled_icon.run(client, message, guildPrefix, config, memberInfo.level);
			}

			//userLeveledUpNotif(message, memberInfo.level, balGain_per_level, balMulti, t2);
			//checkUserLevel(message); //** CURRENTLY NO LONGER IN USE & OUTDATED **//
		}
		memberInfo.exp = newXP;
		memberInfo.lastMsg = currTime + msgLevelDelay;
		await sqlHand.setData(client, `./SQL/guild_data/${guildID}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
	}
}

function userLeveledUpNotif(message, level, gold, multi, t2)
{
	if(multi)
		gold += gold;

	const lvl = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
		.setThumbnail(message.author.displayAvatarURL);

	if(t2)
		lvl.addField(`**LEVEL UP!**`, `${message.author} is now **level ${level}!**\nYou have gained **${gold} Quarters** & **a TIER II Crate Drop** within the, **${message.guild.name}** server!`);
	else
		lvl.addField(`**LEVEL UP!**`, `${message.author} is now **level ${level}!**\nYou have gained **${gold} Quarters** & **a Crate Drop** within the, **${message.guild.name}** server!`);

	message.author.send({embed:lvl});

}

async function suggestionsMessageCheck(client, message)
{
	var guildChannelsSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`);
	var table = guildChannelsSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();

	if(!table['count(*)'])
	{
		guildChannelsSQL.close();
		return;
	}

	client.getData = guildChannelsSQL.prepare("SELECT * FROM data WHERE id = ?");
  	client.setData = guildChannelsSQL.prepare(config.setChannelSettings);

	var guildSettings = client.getData.get(message.guild.id);
	if(message.channel.id == guildSettings.suggestions_channel && !(message.author.bot))
	{
		const suggestEmbed = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
		.setDescription(message.content)
		.setFooter("New suggested idea submission")
		.setTimestamp();

		message.delete();

		let msg = await client.channels.get(guildSettings.suggestions_channel).send({embed:suggestEmbed});
		await msg.react(client.emojis.get('567699131733245992')); //Check || '✅'
		await msg.react(client.emojis.get('559030535540834324')); //X || '❎'
	}

	guildChannelsSQL.close();
	return;
}

client.login(config.token);
