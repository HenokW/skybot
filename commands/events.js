const Discord = require("discord.js");
const canvas = require('canvas');
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");
const config = require("../config.json");

//=============================================//
const isEventsSettingsDisabled = false;
const settingsWidth = 510;
const settingsHeight = 420;

const emote1 = "1⃣";
const emote2 = "2⃣";
const emote3 = "3⃣";
const emote4 = "4⃣";

//--
const evSettings = './resources/settings/event_settings.png';
const evNo = './resources/settings/event_off.png';
const evYes = './resources/settings/event_on.png';

const success_emote = '<:success_emote:567699131733245992>';
const failed_emote = '<:warning_emote:559030535540834324>';
//=============================================//
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, config) =>
{
	//if(message.guild.id != '541420301049790464' || message.channel.id != '346430947421323267') return message.channel.send("Events have been disabled for this guild.");
	if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id != '148278118170361857') return;

	message.channel.startTyping();
	cmd = args.shift();

	//Loading / defining the canvas
	let eventsCanvas = canvas.createCanvas(settingsWidth, settingsHeight);
	let cetx = eventsCanvas.getContext('2d');

	let events_picture = await canvas.loadImage(evSettings);
	let event_no = await canvas.loadImage(evNo);
	let event_yes = await canvas.loadImage(evYes);

	//Applying the BG
	cetx.clearRect(0, 0, settingsWidth, settingsHeight);
	cetx.drawImage(events_picture, 0, 0, eventsCanvas.width, eventsCanvas.height);

	//Grabbing the SQL data needed
	var guildEventsData = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, "data", "guild", guild.id);

	//--
	var userJoinedToggle = guildEventsData.settingUserJoin;
	var userLeaveToggle = guildEventsData.settingUserLeave;
	var userEditMsgToggle = guildEventsData.settingEditMessage;
	var userDelMsgToggle = guildEventsData.settingDeleteMessage;

	//Settings
	if(userJoinedToggle == 1)
		cetx.drawImage(event_yes, (settingsWidth / 2) - 105, (settingsHeight / 2) - 76, 50, 25);
	else
		cetx.drawImage(event_no, (settingsWidth / 2) - 102, (settingsHeight / 2) - 76, 50, 25);

	if(userLeaveToggle == 1)
		cetx.drawImage(event_yes, (settingsWidth / 2) - 83, (settingsHeight / 2) - 76 + 55, 50, 25);
	else
		cetx.drawImage(event_no, (settingsWidth / 2) - 80, (settingsHeight / 2) - 76 + 55, 50, 25);

	if(userEditMsgToggle == 1)
		cetx.drawImage(event_yes, (settingsWidth / 2) - 23, (settingsHeight / 2) - 76 + (55 * 2), 50, 25);
	else
		cetx.drawImage(event_no, (settingsWidth / 2) - 20, (settingsHeight / 2) - 76 + (55 * 2), 50, 25);

	if(userDelMsgToggle == 1)
		cetx.drawImage(event_yes, (settingsWidth / 2) - 10, (settingsHeight / 2) - 76 + (55 * 3), 50, 25);
	else
		cetx.drawImage(event_no, (settingsWidth / 2) - 7, (settingsHeight / 2) - 76 + (55 * 3), 50, 25);
	//---------

	if(cmd == "settings")
	{
		eveSettingsRunthrough = true;
		while(eveSettingsRunthrough)
		{
			message.channel.startTyping();

			//Loading / defining the canvas
			let eventsCanvas = canvas.createCanvas(settingsWidth, settingsHeight);
			let cetx = eventsCanvas.getContext('2d');

			let events_picture = await canvas.loadImage(evSettings);
			let event_no = await canvas.loadImage(evNo);
			let event_yes = await canvas.loadImage(evYes);

			//Applying the BG
			cetx.clearRect(0, 0, settingsWidth, settingsHeight);
			cetx.drawImage(events_picture, 0, 0, eventsCanvas.width, eventsCanvas.height);

			//Grabbing the SQL data needed
			var guildEventsData = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, "data", "guild", guild.id);
			//--
			var userJoinedToggle = guildEventsData.settingUserJoin;
			var userLeaveToggle = guildEventsData.settingUserLeave;
			var userEditMsgToggle = guildEventsData.settingEditMessage;
			var userDelMsgToggle = guildEventsData.settingDeleteMessage;

			// //Loading / defining the canvas
			// let eventsCanvas = canvas.createCanvas(settingsWidth, settingsHeight);
			// let cetx = eventsCanvas.getContext('2d');

			// let events_picture = await canvas.loadImage(evSettings);
			// let event_no = await canvas.loadImage(evNo);
			// let event_yes = await canvas.loadImage(evYes);

			// //Applying the BG
			// cetx.clearRect(0, 0, settingsWidth, settingsHeight);
			// cetx.drawImage(events_picture, 0, 0, eventsCanvas.width, eventsCanvas.height);

			//Settings
			if(userJoinedToggle == 1)
				cetx.drawImage(event_yes, (settingsWidth / 2) - 105, (settingsHeight / 2) - 76, 50, 25);
			else
				cetx.drawImage(event_no, (settingsWidth / 2) - 102, (settingsHeight / 2) - 76, 50, 25);

			if(userLeaveToggle == 1)
				cetx.drawImage(event_yes, (settingsWidth / 2) - 83, (settingsHeight / 2) - 76 + 55, 50, 25);
			else
				cetx.drawImage(event_no, (settingsWidth / 2) - 80, (settingsHeight / 2) - 76 + 55, 50, 25);

			if(userEditMsgToggle == 1)
				cetx.drawImage(event_yes, (settingsWidth / 2) - 23, (settingsHeight / 2) - 76 + (55 * 2), 50, 25);
			else
				cetx.drawImage(event_no, (settingsWidth / 2) - 20, (settingsHeight / 2) - 76 + (55 * 2), 50, 25);

			if(userDelMsgToggle == 1)
				cetx.drawImage(event_yes, (settingsWidth / 2) - 10, (settingsHeight / 2) - 76 + (55 * 3), 50, 25);
			else
				cetx.drawImage(event_no, (settingsWidth / 2) - 7, (settingsHeight / 2) - 76 + (55 * 3), 50, 25);
			//---------

			event = new Discord.Attachment(eventsCanvas.toBuffer(), 'event_settings.png');
			settingMsg = await message.channel.send(message.author + ", here are you current settings, which would you like to toggle?", event);
			await settingMsg.react(emote1);
			await settingMsg.react(emote2);
			await settingMsg.react(emote3);
			await settingMsg.react(emote4);

			message.channel.stopTyping();
			const eveReactions = await settingMsg.awaitReactions(reaction => reaction.emoji.name === emote1 || reaction.emoji.name === emote2 || reaction.emoji.name === emote3 || reaction.emoji.name === emote4, {time: 10000, max: 2});
			try{ eveCount1 = (eveReactions.get(emote1).count - 1); }
				catch(e) { eveCount1 = 0;}
			try{ eveCount2 = (eveReactions.get(emote2).count - 1); }
				catch(e) { eveCount2 = 0;}
			try{ eveCount3 = (eveReactions.get(emote3).count - 1); }
				catch(e) { eveCount3 = 0;}
			try{ eveCount4 = (eveReactions.get(emote4).count - 1); }
				catch(e) { eveCount4 = 0;}


			if(eveCount1 >= 1)
			{
				if(guildEventsData.settingUserJoin == 1)
					guildEventsData.settingUserJoin = 0;
				else
					guildEventsData.settingUserJoin = 1;

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, config.guildSettingsSQLSetter, guildEventsData);
				settingMsg.delete();
			}
			else if(eveCount2 >= 1)
			{
				if(guildEventsData.settingUserLeave == 1)
					guildEventsData.settingUserLeave = 0;
				else
					guildEventsData.settingUserLeave = 1;

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, config.guildSettingsSQLSetter, guildEventsData);
				settingMsg.delete();
			}
			else if(eveCount3 >= 1)
			{
				if(guildEventsData.settingEditMessage == 1)
					guildEventsData.settingEditMessage = 0;
				else
					guildEventsData.settingEditMessage = 1;

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, config.guildSettingsSQLSetter, guildEventsData);
				settingMsg.delete();
			}
			else if(eveCount4 >= 1)
			{
				if(guildEventsData.settingDeleteMessage == 1)
					guildEventsData.settingDeleteMessage = 0;
				else
					guildEventsData.settingDeleteMessage = 1;

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, config.guildSettingsSQLSetter, guildEventsData);
				settingMsg.delete();
			}
			else
			{
				await settingMsg.clearReactions();
				eveSettingsRunthrough = false;

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, config.guildSettingsSQLSetter, guildEventsData);
			}
		}
	}
	else if(cmd == 'welcome')
	{
		if(args[0] == 'message')
		{
			let response = new Discord.RichEmbed()
				.setColor("#3abe24")
				.setTitle("Creating a new welcome message")
				.setDescription("Please enter what you would like your new welcome message to display when a new user joins your server.")
				.addField("Placeholder phrases",
				"Placeholder phrases are words you use to be filled in at a later date. The following phrases can be used anywhere within your message:\n\n" +
				"**`{user}`** - Replaces {user} with the name of the user that joins the server.\n" +
				"**`{server}`** - Replaces {server} with the name of Discord server.\n\n" +

				"Example: 'Welcome {user} to the Official {server} Discord server!'");

			await message.reply({embed:response})
			await startMessageGrab(client, message, "welcome");
		}
		else
		{
			let guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);
			if(args[0] == undefined || args[0] == null)
			{
				guildInfo.welcome_channel = null;
				await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);
				message.channel.send(`${success_emote} ${message.author}, the welcome channel has successfully been reset.`);
			}
			else
			{
				guildInfo.welcome_channel = message.mentions.channels.first().id;
				await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);
				message.channel.send(`${success_emote} ${message.author}, the welcome channel has successfully been set to ${message.mentions.channels.first()}.`);
			}
		}
	}
	else if(cmd == 'leave')
	{
		if(args[0] == 'message')
		{
			let response = new Discord.RichEmbed()
				.setColor("#3abe24")
				.setTitle("Creating a new leave message")
				.setDescription("Please enter what you would like your new leave message to display when a user leaves your server.")
				.addField("Placeholder phrases",
				"Placeholder phrases are words you use to be filled in at a later date. The following phrases can be used anywhere within your message:\n\n" +
				"**`{user}`** - Replaces {user} with the name of the user that leaves the server.\n" +
				"**`{server}`** - Replaces {server} with the name of Discord server.\n\n" +

				"Example: '{user} is no longer with us'");

			await message.reply({embed:response})
			await startMessageGrab(client, message, "leave");
		}
		else
		{
			let guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);
			if(args[0] == undefined || args[0] == null)
			{
				guildInfo.leave_channel = null;
				await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);
				message.channel.send(`${success_emote} ${message.author}, the leave channel has successfully been reset.`);
			}
			else
			{
				guildInfo.leave_channel = message.mentions.channels.first().id;
				await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);
				message.channel.send(`${success_emote} ${message.author}, the leave channel has successfully been set to ${message.mentions.channels.first()}.`);
			}
		}
	}
	else if(cmd == "help")
	{
		let eventsHelp = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
			.setTitle("Events Commands List")
			.addField("Commands:",
			"**`" + guildPrefix + "events`** - Returns the server's current event settings\n" +
			"**`" + guildPrefix + "events settings`** - Modify the server's event settings\n\n" +

			"**`" + guildPrefix + "events welcome`** - Resets the current welcome channel\n" +
			"**`" + guildPrefix + "events welcome <#channel>`** - Directs welcome messages to the specified channel\n" +
			"**`" + guildPrefix + "events welcome message`** - Sets a new welcome message\n\n" +

			"**`" + guildPrefix + "events leave`** - Resets the current leave channel\n" +
			"**`" + guildPrefix + "events leave <#channel>`** - Directs leave messages to the specified channel\n" +
			"**`" + guildPrefix + "events leave message`** - Sets a new leave message");

		message.reply({embed:eventsHelp});
	}
	else
	{
		const event = new Discord.Attachment(eventsCanvas.toBuffer(), 'event_settings.png');
		message.channel.send(message.author + ", here are you current settings", event);
	}

	message.channel.stopTyping();
}

async function startMessageGrab(client, message, type)
{
	let delay = 30000; //time in milliseconds
	let collector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: delay, errors:['time']});

	collector.once('collect', async info =>
	{
		switch(type)
		{
			case "welcome":
				let guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);

				if(message.content.length > 0)
				{
					guildInfo.joined_message = info.content;
					await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);

					message.reply(`${success_emote} your new welcome message has been successfully saved!`);
				}
				else
				{
					guildInfo.joined_message = config.default_welcome_message;
					await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfo);

					message.reply(`${success_emote} your welcome message has been reset to its default state.`);
				}
				break;
			case "leave":
				let guildInfoL = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);

				if(message.content.length > 0)
				{
					guildInfoL.leave_message = info.content;
					await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfoL);

					message.reply(`${success_emote} your new leave message has been successfully saved!`);
				}
				else
				{
					guildInfo.leave_message = config.default_leave_message;
					await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildInfoL);

					message.reply(`${success_emote} your leave message has been reset to its default state.`);
				}
				break;
		}
	});
	collector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} No welcome message has been saved due to inactivity.`); });
}
