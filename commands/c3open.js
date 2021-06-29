const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

//============================
const isDisabled = false;
const isClosed = true;

const noob_role_id = '554042363304214528';
const lord_role_id = '554042362079215619';

const crate3BG_rewards1 = './resources/prof_bg/bg1.png';
const crate3BG_rewards2 = './resources/prof_bg/bg2.png';
const crate3BG_rewards7 = './resources/prof_bg/bg7.png';

const crate3BG_rewards3 = './resources/prof_bg/bg3.png';
const crate3BG_rewards4 = './resources/prof_bg/bg4.png';
const crate3BG_rewards11 = './resources/prof_bg/bg11.png';
const crate3BG_rewards14 = './resources/prof_bg/bg14.png';
const crate3BG_rewards15 = './resources/prof_bg/bg15.png';
const crate3BG_rewards10 = './resources/prof_bg/bg10.png';
//============================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(isClosed) return;
	message.channel.startTyping();

	// message.channel.send("This command is not yet setup!");
	if(!(isDisabled && guild.id != '346430947421323267'))
		rollReward(guild, client, message, args, guildPrefix);
	else
		message.channel.send("**Crates have been temporarily disabled.**");
}

async function rollReward(guild, client, message, args, guildPrefix)
{
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

	//Checks--
	if(memberInfo.crates3 <= 0)
	{
		message.channel.send(message.author + ", you do not have any creates to open!");
		message.channel.stopTyping();
		return;
	}
	else
	{
		memberInfo.openedCrates++;
		memberInfo.crates3--;
	}

	//=====Defining=====
	var numCap = 1000;

	bal_1_chance = (50 / 100) * numCap; //500 - 1500
	bal_2_chance = (15 / 100) * numCap; //1500 - 5000
	bal_3_chance = (7.5 / 100) * numCap; //5000 - 7500
	noob_role = (7 / 100) * numCap; //554042363304214528
	lord_role = (1 / 100) * numCap; //554042362079215619
	bg1_2_7_chance = (10.5 / 100) * numCap;
	bg4_11_14_15_10_chance = (5 / 100) * numCap;
	nothing = (4 / 100) * numCap;
	// bal_multiplier = (5 / 100) * numCap;

	//=======================================================

	//My terrible roll code
	rolledNum = Math.floor(Math.random() *  numCap) + 1;
	if(rolledNum <= bal_1_chance)
	{
		giveBal = Math.floor(Math.random() * 1000) + 501;

		currTime = Math.round((new Date()).getTime() / 1000);
		if(memberInfo.balMultiplierTimer > currTime)
		{
			memberInfo.bal += giveBal * 2;
			memberInfo.balTotal += giveBal * 2;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal * 2 + " Quarters (doubled)!**");
		}
		else
		{
			memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance) && rolledNum > bal_1_chance)
	{
		giveBal = Math.floor(Math.random() * 3500) + 1501;

		currTime = Math.round((new Date()).getTime() / 1000);
		if(memberInfo.balMultiplierTimer > currTime)
		{
			memberInfo.bal += giveBal * 2;
			memberInfo.balTotal += giveBal * 2;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal * 2 + " Quarters (doubled)!**");
		}
		else
		{
			memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance) && rolledNum > bal_1_chance + bal_2_chance)
	{
		giveBal = Math.floor(Math.random() * 2500) + 5001;

		currTime = Math.round((new Date()).getTime() / 1000);
		if(memberInfo.balMultiplierTimer > currTime)
		{
			memberInfo.bal += giveBal * 2;
			memberInfo.balTotal += giveBal * 2;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal * 2 + " Quarters (doubled)!**");
		}
		else
		{
			memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance)
	{
		if(guild.id == '541420301049790464')
		{
			let userProf = message.guild.members.find(member => member.id == message.author.id);
			guild_noob_role = message.guild.roles.find(role => role.id == noob_role_id);

			if(!userProf.roles.has(guild_noob_role.id))
			{
				userProf.addRole(guild_noob_role);
				message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded the **Crate Noob Role!**");
			}
			else
			{
				memberInfo.bal += 500;
				memberInfo.balTotal += 500;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **500 Quarters!**");
			}
		}
		else
		{
			memberInfo.bal += 500;
			memberInfo.balTotal += 500;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **500 Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance + noob_role)
	{
		if(guild.id == '541420301049790464')
		{
			let userProf = message.guild.members.find(member => member.id == message.author.id);
			lord_role = message.guild.roles.find(role => role.id == lord_role_id);

			if(!userProf.roles.has(lord_role.id))
			{
				userProf.addRole(lord_role);
				message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded the **Crate Lord Role!**");
			}
			else
			{
				memberInfo.bal += 750;
				memberInfo.balTotal += 750;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **750 Quarters!**");
			}
		}
		else
		{
			memberInfo.bal += 750;
			memberInfo.balTotal += 750;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
			message.channel.send(message.author + " has opened a **TIER III CRATE**, and has been awarded **750 Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role)
	{
		message.channel.send(message.author + " has opened a **TIER III CRATE**, and has unfortunatly recieved **Nothing!**");
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing + bg1_2_7_chance) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing)
	{
		var memberBgCrateInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);

		if(memberBgCrateInfo.bg2 != 1)
		{
			memberBgCrateInfo.bg2 = 1;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

			message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards1] });
		}
		else if(memberBgCrateInfo.bg3 != 1)
		{
			memberBgCrateInfo.bg3 = 1;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

			message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards2] });
		}
		else if(memberBgCrateInfo.bg8 != 1)
		{
			memberBgCrateInfo.bg8 = 1;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

			message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards7] });
		}
		else
		{
			memberInfo.bal += 350;
			memberInfo.balTotal += 350;
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
			message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **350 Quarters!**");
		}
	}
	else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing + bg1_2_7_chance + bg4_11_14_15_10_chance) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing + bg1_2_7_chance)
	{ //bg4_11_14_15_10_chance
		var memberBgCrateInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);

		randBG = Math.floor(Math.random() * 5) + 1;
		if(randBG == 1) //bg4
		{
			if(memberBgCrateInfo.bg5 != 1)
			{
				memberBgCrateInfo.bg5 = 1;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

				message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards4] });
			}
			else
			{
				memberInfo.bal += 399;
				memberInfo.balTotal += 399;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **399 Quarters!**");
			}
		}
		else if(randBG == 2) //bg11
		{
			if(memberBgCrateInfo.bg12 != 1)
			{
				memberBgCrateInfo.bg12 = 1;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

				message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards11] });
			}
			else
			{
				memberInfo.bal += 399;
				memberInfo.balTotal += 399;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **399 Quarters!**");
			}
		}
		else if(randBG == 3) //bg14
		{
			if(memberBgCrateInfo.bg15 != 1)
			{
				memberBgCrateInfo.bg15 = 1;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

				message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards14] });
			}
			else
			{
				memberInfo.bal += 399;
				memberInfo.balTotal += 399;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **399 Quarters!**");
			}
		}
		else if(randBG == 4) //bg15
		{
			if(memberBgCrateInfo.bg16 != 1)
			{
				memberBgCrateInfo.bg16 = 1;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);
				message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards15] });
			}
			else
			{
				memberInfo.bal += 399;
				memberInfo.balTotal += 399;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **399 Quarters!**");
			}
		}
		else if(randBG == 5) //bg10
		{
			if(memberBgCrateInfo.bg11 != 1)
			{
				memberBgCrateInfo.bg11 = 1;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberBgCrateInfo);

				message.channel.send(message.author + ", has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [crate3BG_rewards10] });
			}
			else
			{
				memberInfo.bal += 399;
				memberInfo.balTotal += 399;
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				message.channel.send(message.author + ". has opened a **TIER III CRATE**, and has been awarded **399 Quarters!**");
			}
		}
	}
	// else if(rolledNum < (bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing + bal_multiplier) && rolledNum > bal_1_chance + bal_2_chance + bal_3_chance + noob_role + lord_role + nothing)
	// {

	// 	currTime = Math.round((new Date()).getTime() / 1000);

	// 	//If they have no current multiplier, just give it to them (current length: 1 hr)
	// 	if(memberInfo.balMultiplierTimer < currTime + 60)
	// 		memberInfo.balMultiplierTimer = currTime + 60;
	// 	else //They already have an active multiplier, let's add onto it
	// 		memberInfo.balMultiplierTimer += 60;

	// 	await await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);

	// 	difference = Math.abs(memberInfo.balMultiplierTimer - currTime) + 3600;
	// 	message.channel.send(message.author + " has been awarded **a 2x Quarters Multiplier** for an hour!");
	// 	message.author.send("You currently have: **" + difference + " Minutes** left on your multiplier.");
	// }
	else
		message.channel.send(message.author + " has opened a **TIER III CRATE**, and has unfortunatly recieved **Nothing!**");
	//==================

	try
	{
		await await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
	} catch(e){ }

	message.channel.stopTyping();
}
