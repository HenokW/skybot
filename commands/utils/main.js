const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
config = undefined;

//============================
const notifiers = ['516206994718326795', '148278118170361857']; //We're going to have to send a message to a selected bunch to notify them of an admin/someone gifting crates
const balanceModDisabled = true; //Is balance modifying enabled / disabled?
let lastUser = '';

//============================

module.exports.run = async(client, message, args, confi) =>
{
	config = confi;
	cmd = args.shift().toLowerCase();
	if(cmd == "get") //general structure would be "s.get <USER_ID> <identifier>"
	{
		//User ID passed
		userID = args.shift();
		identifier = args.shift().toLowerCase();

		const memberSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);

		client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setMemberData = memberSQL.prepare(config.usersSQLSetter);

		try
		{
			let memberInfo = client.getMemberData.get(userID);
			if(identifier == "bal")
				returnData = memberInfo.bal;
			else if(identifier == "crates")
				returnData = memberInfo.crates;
			else if(identifier == "level")
				returnData = memberInfo.level;

			message.channel.send(returnData);
		}
		catch(e)
		{
			notify(client, message, "Invalid member passed, unable to find user: `" + userID + "`. Value passed from RPG bot to Main bot.");
		}
	}
	else if(cmd == "cb") //general structure would be "s.get <USER_ID> <identifier>"
	{
		incoming = message.content.replace('(', '').replace(',', '').replace(')', '').replace("'", '');
		incoming = incoming.slice(7).trim().split(' ');

		//User ID passed
		userAmount = incoming[0] * 1;
		userID = incoming[1];
		identifier = "bal";

		const memberSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);

		client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setMemberData = memberSQL.prepare(config.usersSQLSetter);

		try
		{
			let memberInfo = client.getMemberData.get(userID);
			if(identifier == "bal")
			{
				returnData = memberInfo.bal;
				lastUser = userID;
				if(returnData >= userAmount)
					message.channel.send("True");
				else
					message.channel.send("False");
			}
		}
		catch(e)
		{
			client.emit("error", e);
			notify(client, message, "Invalid member passed, unable to find user: `" + userID + "`. Value passed from RPG bot to Main bot.");
		}

		memberSQL.close();
	}
	else if(cmd == "subbal") //general structure would be "s.get <USER_ID> <identifier>"
	{
		userAmount = args.shift();
		redUser = args.shift();

		const memberSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);

		client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setMemberData = memberSQL.prepare(config.usersSQLSetter);

		try
		{
			if(!balanceModDisabled)
			{
				let memberInfo = client.getMemberData.get(redUser);
				memberInfo.bal -= Math.floor(userAmount);

				client.setMemberData.run(memberInfo);
			}
			else
				message.channel.send("Balance modifying is currently disabled.");
		}
		catch(e)
		{
			client.emit("error", e);
			notify(client, message, "Invalid member passed, unable to find user: `" + userID + "`. Value passed from RPG bot to Main bot.");
		}

		memberSQL.close();
	}
	else if(cmd == "addbal") //general structure would be "s.get <USER_ID> <identifier>"
	{
		userAmount = args.shift();
		redUser = args.shift();

		const memberSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);

		client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");
		client.setMemberData = memberSQL.prepare(config.usersSQLSetter);

		try
		{
			if(!balanceModDisabled)
			{
				let memberInfo = client.getMemberData.get(redUser);
				memberInfo.bal += Math.floor(userAmount);
				memberInfo.balTotal += Math.floor(userAmount);

				client.setMemberData.run(memberInfo);
			}
			else
				message.channel.send("Balance modifying is currently disabled.");
		}
		catch(e)
		{
			client.emit("error", e);
			notify(client, message, "Invalid member passed, unable to find user: `" + userID + "`. Value passed from RPG bot to Main bot.");
		}

		memberSQL.close();
	}
	else
		notify(client, message, "Invalid command type passed from RPG bot to the Main bot. (The only allowed command types are 'get' & 'set' & 'subbal' & 'cb').");

	// notify(client, message, "Message content: `" + message.content + "`");
}

function notify(client, message, error)
{
	const guild = client.guilds.get(message.guild.id); //The channel ID of the channel (Currently #roles in Logic Discord)

	for(_n = 0; _n < notifiers.length; _n++)
	{
		let notifier = guild.members.find(member => member.id == notifiers[_n]);
		notifier.send("========================\n" + "**INCOMING ERROR: **" + error + "\n----------END----------").catch();
	}
}
