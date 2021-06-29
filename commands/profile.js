const Discord = require("discord.js");
const canvas = require('canvas');
const snekfetch = require('snekfetch');
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

const ACHIEVEMENT_COUNT = 7;
const BACKGROUND_COUNT = 26;
//=============================================//
const isProfileDisabled = false;
const isAchievementsDisabled = false;
const isProfileStaffBannersDisabled = true;
const isProfileSettingsDisabled = false;

const profile_width = 600;
const profile_height = 500;

const moji1 = '572583074072887306';
const moji2 = '572583074441854976';
const moji3 = '579508950118957063';
const moji4 = '579508952090279960';
const moji5 = '579508952622956554';
const moji6 = '579508952652316691';
const moji7 = '579508952484675596';
const leftMoji = '572584617337552945';
const rightMoji = '572584617681485835';
const checkMoji = '572586110832869378';
//=============================================//

//-----BACKGROUND DATA------
var bgData = [];
bgData[0] = './resources/prof_bg/default_bg0.png'; //Default Discord BG
bgData[1] = './resources/prof_bg/bg1.png';
bgData[2] = './resources/prof_bg/bg2.png';
bgData[3] = './resources/prof_bg/bg3.png';
bgData[4] = './resources/prof_bg/bg4.png';
bgData[5] = './resources/prof_bg/bg5.png';
bgData[6] = './resources/prof_bg/bg6.png';
bgData[7] = './resources/prof_bg/bg7.png';
bgData[8] = './resources/prof_bg/bg8.png';
bgData[9] = './resources/prof_bg/bg9.png';
bgData[10] = './resources/prof_bg/bg10.png';
bgData[11] = './resources/prof_bg/bg11.png';
bgData[12] = './resources/prof_bg/bg12.png';
bgData[13] = './resources/prof_bg/bg13.png';
bgData[14] = './resources/prof_bg/bg14.png';
bgData[15] = './resources/prof_bg/bg15.png';
bgData[16] = './resources/prof_bg/bg16.png';
bgData[17] = './resources/prof_bg/bg17.png';
bgData[18] = './resources/prof_bg/bg18.png';
bgData[19] = './resources/prof_bg/bg19.png';
bgData[20] = './resources/prof_bg/bg20.png';
bgData[21] = './resources/prof_bg/bg21.png';
bgData[22] = './resources/prof_bg/bg22.png';
bgData[23] = './resources/prof_bg/bg23.png';
bgData[24] = './resources/prof_bg/bg24.png';
bgData[25] = './resources/prof_bg/bg25.png';
//=======================================================================


//--------ACHIEVEMENT DATA--------
var achAddons = [];
achAddons[0] = './resources/prof_addons/achievements/reset.png';
achAddons[1] = './resources/prof_addons/achievements/crate_god.png'; //--
achAddons[2] = './resources/prof_addons/achievements/collector.png';
achAddons[3] = './resources/prof_addons/achievements/early_bird.png'; //--
achAddons[4] = './resources/prof_addons/achievements/millionaire.png'; //--
achAddons[5] = './resources/prof_addons/achievements/nweb.png';
achAddons[6] = './resources/prof_addons/achievements/staff.png'; //--
achAddons[7] = './resources/prof_addons/achievements/donor.png'; //--
//=========================================================================


//--------STAFF/SPECIAL BANNERS--------
var banner_black = './resources/prof_banners/staff/banner_black.png';
var banner_blue = './resources/prof_banners/staff/banner_blue.png';
var banner_green = './resources/prof_banners/staff/banner_green.png';
var banner_grey = './resources/prof_banners/staff/banner_grey.png';
var banner_orange = './resources/prof_banners/staff/banner_orange.png';
var banner_purple = './resources/prof_banners/staff/banner_purple.png';
var banner_teal = './resources/prof_banners/staff/banner_teal.png';
var banner_yellow = './resources/prof_banners/staff/banner_yellow.png';
//=======================================================================


//--------PROFILE ADDONS--------
var newCapsules = './resources/prof_addons/new_capsules.png';
var newCrate = './resources/prof_addons/new_crate.png';
var crateTier = './resources/prof_addons/tier_dot.png';
var crateTierEmpty = './resources/prof_addons/tier_dot_empty.png';
//=======================================================================

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	const initTime = Math.round((new Date()).getTime());

	message.channel.startTyping();
	if(!isProfileDisabled || message.guild.id == '346430947421323267')
	{
		var myProfileCanvas = canvas.createCanvas(profile_width, profile_height);
		var cptx = myProfileCanvas.getContext('2d');

		try
		{
			mentionedUser = message.mentions.members.first().user;
		}catch(e) { mentionedUser = undefined;}

		cmd = args.shift();
		if(cmd == "settings")
		{
			message.channel.send(message.author + ", please check your DMs!");
			startUserSettings(client, guild, message);
		}
		else if((mentionedUser == undefined || mentionedUser == null) && (!args[0])) //No other arg passed
		{
			var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
			showUserProfile(guild, client, message, memberInfo, myProfileCanvas, cptx, undefined);
		}
		else if(mentionedUser != undefined)
		{
			var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", mentionedUser.id);
			showUserProfile(guild, client, message, memberInfo, myProfileCanvas, cptx, mentionedUser);
		}
		else
			message.channel.send(message.author + ", you've tagged an invalid user, please try again.");
	}
	else
		message.channel.send("**User profiles are currently disabled.**");

	message.channel.stopTyping();
}


async function showUserProfile(guild, client, message, memberInfo, myProfileCanvas, cptx, mentionedUser)
{
	myProfileCanvas = canvas.createCanvas(profile_width, profile_height);
	cptx = myProfileCanvas.getContext('2d');

	if(mentionedUser != null && mentionedUser.id == client.user.id)
	{
		var point_amount = "Broke";
		var t1_crate_amount = 999; //crate_amount
		var t2_crate_amount = 999; //crate_amount
		var t3_crate_amount = 999; //crate_amount

		var t1_caps_amount = 999; //Capsules amount
		var t2_caps_amount = 999; //Capsules amount
		var t3_caps_amount = 999; //Capsules amount
	}
	else
	{
		var point_amount = memberInfo.bal;
		var t1_crate_amount = memberInfo.crates; //crate_amount
		var t2_crate_amount = memberInfo.crates2; //crate_amount
		var t3_crate_amount = memberInfo.crates3; //crate_amount

		var t1_caps_amount = memberInfo.caps; //Capsules amount
		var t2_caps_amount = memberInfo.caps2; //Capsules amount
		var t3_caps_amount = memberInfo.caps3; //Capsules amount
	}
	//----------

	if(mentionedUser == undefined)
	{
		var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);
		var memberAchInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_achievement_data.sqlite`, "data", "id", message.author.id);
	}
	else
	{
		var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", mentionedUser.id);
		var memberAchInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_achievement_data.sqlite`, "data", "id", mentionedUser.id);
	}

	var user_currBG = await canvas.loadImage(bgData[memberBgInfo.currentBG]);
	var newCrateIcon = await canvas.loadImage(newCrate);
	//var newCapsulesIcon = await canvas.loadImage(newCapsules);
	var tierIcon = await canvas.loadImage(crateTier);
	var tierIconEmpty = await canvas.loadImage(crateTierEmpty);

	//-----------
	//Addons
	if(!isProfileStaffBannersDisabled)
	{
		var banner_black_p = await canvas.loadImage(banner_black);
		var banner_blue_p = await canvas.loadImage(banner_blue);
		var banner_green_p = await canvas.loadImage(banner_green);
		var banner_grey_p = await canvas.loadImage(banner_grey);
		var banner_orange_p = await canvas.loadImage(banner_orange);
		var banner_purple_p = await canvas.loadImage(banner_purple);
		var banner_teal_p = await canvas.loadImage(banner_teal);
		var banner_yellow_p = await canvas.loadImage(crateIcon);
	}

	if(!isAchievementsDisabled)
	{
		achIcons = [];
		achIcons[1] = await canvas.loadImage(achAddons[1]);
		achIcons[2] = await canvas.loadImage(achAddons[2]);
		achIcons[3] = await canvas.loadImage(achAddons[3]);
		achIcons[4] = await canvas.loadImage(achAddons[4]);
		achIcons[5] = await canvas.loadImage(achAddons[5]);
		achIcons[6] = await canvas.loadImage(achAddons[6]);
		achIcons[7] = await canvas.loadImage(achAddons[7]);
	}
	// -----------

	//BG
	cptx.clearRect(0, 0, profile_width, profile_height);
	cptx.drawImage(user_currBG, 0, 0, myProfileCanvas.width, myProfileCanvas.height);
	//---
	cptx.drawImage(newCrateIcon, 60, myProfileCanvas.height - 22, 40, 20); //Very bottom
	cptx.drawImage(tierIcon, 47, myProfileCanvas.height - 18, 15, 15);
	//-

	//--
	cptx.drawImage(newCrateIcon, 60, myProfileCanvas.height - 22 - 22, 40, 20);
	cptx.drawImage(tierIcon, 47, myProfileCanvas.height - 17 - 24, 15, 15); //Very bottom
	cptx.drawImage(tierIcon, 47 - 10, myProfileCanvas.height - 17 - 24, 15, 15); //Very bottom
	//--

	//---
	cptx.drawImage(newCrateIcon, 60, myProfileCanvas.height - 22 - 44, 40, 20);
	cptx.drawImage(tierIcon, 47, myProfileCanvas.height - 17 - 25 - 22, 15, 15); //Very bottom
	cptx.drawImage(tierIcon, 47 - 10, myProfileCanvas.height - 17 - 25 - 22, 15, 15); //Very bottom
	cptx.drawImage(tierIcon, 47 - 20, myProfileCanvas.height - 17 - 25 - 22, 15, 15); //Very bottom
	//---

	/*
	//---CAPS---
	cptx.drawImage(newCapsulesIcon, myProfileCanvas.width - 60 - 40, myProfileCanvas.height - 22, 40, 20); //Very bottom
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 - 15, myProfileCanvas.height - 20, 15, 15);

	cptx.drawImage(newCapsulesIcon, myProfileCanvas.width - 60 - 40, myProfileCanvas.height - 22 - 22, 40, 20);
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 - 5, myProfileCanvas.height - 17 - 24, 15, 15);
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 - 15, myProfileCanvas.height - 17 - 24, 15, 15);

	cptx.drawImage(newCapsulesIcon, myProfileCanvas.width - 60 - 40, myProfileCanvas.height - 22 - 44, 40, 20);
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 + 5, myProfileCanvas.height - 17 - 25 - 22, 15, 15);
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 - 5, myProfileCanvas.height - 17 - 25 - 22, 15, 15);
	cptx.drawImage(tierIcon, myProfileCanvas.width - 47 - 15, myProfileCanvas.height - 17 - 25 - 22, 15, 15);

	//---
	*/

	// cptx.drawImage(crate_t3_icon, myProfileCanvas.width - 60, (myProfileCanvas.height / 2) + 100, 60, 60);
	// cptx.drawImage(crate_t2_icon, myProfileCanvas.width - 60, (myProfileCanvas.height / 2) + 100 - 60, 60, 60);
	// cptx.drawImage(crate_t1_icon, myProfileCanvas.width - 60, (myProfileCanvas.height / 2) + 100 - 120, 60, 60);

	//----ACHIEVEMENT START----

	if(!isAchievementsDisabled)
	{
		if(memberAchInfo.slot1 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot1], 25, Math.floor(myProfileCanvas.height / 2) - 15, 150, 50);
		if(memberAchInfo.slot4 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot4], 25, Math.floor(myProfileCanvas.height / 2) + 40, 150, 50);
		if(memberAchInfo.slot7 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot7], 25, Math.floor(myProfileCanvas.height / 2) + 95, 150, 50);

		if(memberAchInfo.slot2 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot2], 25 + 160, Math.floor(myProfileCanvas.height / 2) - 15, 150, 50);
		if(memberAchInfo.slot5 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot5], 25 + 160, Math.floor(myProfileCanvas.height / 2) + 40, 150, 50);

		if(memberAchInfo.slot3 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot3], 25 + 320, Math.floor(myProfileCanvas.height / 2) - 15, 150, 50);
		if(memberAchInfo.slot6 != 0)
			cptx.drawImage(achIcons[memberAchInfo.slot6], 25 + 320, Math.floor(myProfileCanvas.height / 2) + 40, 150, 50);
	}
	//----ACHIEVEMENT END----

	//-----BANNER START------
	//-----BANNER END------
	//Username
	cptx.font = '40px Biko';
	cptx.textAlign = 'center';
	cptx.fillStyle = '#ffffff';
	if(mentionedUser == undefined)
		cptx.fillText(`${message.author.username}#${message.author.discriminator}`, Math.floor(myProfileCanvas.width / 2) + 90, Math.floor(myProfileCanvas.height / 4.5), 365);
	else
		cptx.fillText(`${mentionedUser.username}#${mentionedUser.discriminator}`, Math.floor(myProfileCanvas.width / 2) + 90, Math.floor(myProfileCanvas.height / 4.5), 365);
	cptx.font = '25px Biko';
	if(mentionedUser != null && mentionedUser.id == client.user.id)
		cptx.fillText(`Who dared to ping me!`, Math.floor(myProfileCanvas.width / 2) + 90, Math.floor(myProfileCanvas.height / 3.5));
	else
		cptx.fillText(`Dreams do come true!`, Math.floor(myProfileCanvas.width / 2) + 90, Math.floor(myProfileCanvas.height / 3.5));

	//Logic-Points **Currency** (old)
	cptx.font = '45px Biko';
	//cptx.textAlign = 'center';
	cptx.fillText(`${point_amount}`, Math.floor(myProfileCanvas.width / 2), myProfileCanvas.height - 33);
	cptx.font = '25px Biko';
	cptx.fillText(`Quarters`, Math.floor(myProfileCanvas.width / 2), myProfileCanvas.height - 10);
	cptx.font = '18px Biko';

	cptx.fillText(t1_crate_amount, 114, myProfileCanvas.height - 5);
	cptx.fillText(t2_crate_amount, 114, myProfileCanvas.height - 26.5);
	cptx.fillText(t3_crate_amount, 114, myProfileCanvas.height - 49);

	// cptx.fillText(t1_caps_amount, myProfileCanvas.width - 114, myProfileCanvas.height - 5);
	// cptx.fillText(t2_caps_amount, myProfileCanvas.width - 114, myProfileCanvas.height - 26.5);
	// cptx.fillText(t3_caps_amount, myProfileCanvas.width - 114, myProfileCanvas.height - 49);
	// cptx.font = '25px Biko';
	// cptx.fillText(`${warn_amount} Warns`, (myProfileCanvas.width / 2) + 247, myProfileCanvas.height - 92);

	//****** EXP BAR
	currLevelXPNeeded = Math.floor(5 * (memberInfo.level * memberInfo.level) - 5 * memberInfo.level + 150);

	//cptx.fillStyle = '#ffffff';
	cptx.fillRect((myProfileCanvas.width * -1) + Math.floor((memberInfo.exp / currLevelXPNeeded) * myProfileCanvas.width), Math.floor(myProfileCanvas.height / 2) + 161, myProfileCanvas.width, 16);
	cptx.strokeRect(50, 50, 50, 50);

	cptx.font = '21px Biko';
	cptx.fillStyle = '#000000';
	cptx.fillText(`${memberInfo.exp} / ${currLevelXPNeeded} XP  | Level: ${memberInfo.level}`, Math.floor(myProfileCanvas.width / 2), Math.floor(myProfileCanvas.height / 2) + 177);
	//******
	//*****
	//"Pen tool" for the avatar
	cptx.beginPath();
	//Starts the arc to form a circle
	cptx.arc(100, 100, 100, 0, Math.PI * 2, true);
	// cptx.stroke();
	cptx.closePath();
	//Clips the drawn region
	cptx.clip();

	//User avatar
	if(mentionedUser == undefined)
		var { body: buffer } = await snekfetch.get(message.author.displayAvatarURL);
	else
		var { body: buffer } = await snekfetch.get(mentionedUser.displayAvatarURL);
	var userAva = await canvas.loadImage(buffer);
	cptx.drawImage(userAva, 25, 25, 175, 175); //X, Y, Constrain X, Constrain Y

	//*****

	var testImage = new Discord.Attachment(myProfileCanvas.toBuffer(), 'My_Profile.png');
	message.channel.stopTyping();
	message.channel.send(message.author, testImage);
	//Start to create the canvas, and grab all the available user tags at the same time
}

async function startUserSettings(client, guild, message)
{
	//------------
	const reactA = await client.emojis.get(moji1);
	const reactB = await client.emojis.get(moji2);
	const leftArr = await client.emojis.get(leftMoji);
	const arrowRight = await client.emojis.get(rightMoji);
	const checkEmote = await client.emojis.get(checkMoji);
	//const reactC = "🇨";
	//------------

	//Embedded message to send to the user
	const startSettings = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
		.setThumbnail(message.author.displayAvatarURL)
		.addField("Greetings! Which of your profile settings would you like to customize?",
			reactA + " - Profile Background\n" +
			reactB + " - Achievements")
		.setFooter("User profile settings")
		.setTimestamp();

	//Send the user a message, and add reactions to var them vote
	//Timeout the reactions after a certain amount of time
	var msg = await message.author.send({embed:startSettings});
	await msg.react(reactA); //A
	await msg.react(reactB); //B

	//Grab reactions from the inital message
	const reactions = await msg.awaitReactions(reaction => reaction.emoji.name == reactA.name || reaction.emoji.name == reactB.name, {time: 12000, max: 2});
	try{ countA = (reactions.get(reactA.id).count - 1); }
		catch(e) { countA = 0;}
	try{ countB = (reactions.get(reactB.id).count - 1); }
		catch(e) { countB = 0;}
	msg.delete();

	if(countA >= 1) //Profile backgrounds
	{
		var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);

		//Grabbing available backgrounds
		var available = [];
		for(var i = 1; i <= BACKGROUND_COUNT; i++)
			if(await getSQLData(client, message, `bg${i}`, "BG"))
				available[available.length] = i;


		for(_bg = 0; _bg <= available.length; _bg++)
		{
			attachment = new Discord.Attachment(bgData[available[_bg] - 1], 'bgImage.png');
			const bgSettings = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setThumbnail(message.author.displayAvatarURL)
				.setDescription(`You are now viewing all of your available profile BGs. React to ${checkEmote} if you'd like to set your new profile BG to the current BG.`)
				.setFooter(`Viewing ${_bg + 1} of ${available.length}`)
				.setTimestamp();
			bgSettings.attachFile(attachment)
            bgSettings.setImage('attachment://bgImage.png')

			var msg = await message.author.send({embed:bgSettings});
			await msg.react(leftArr);
			await msg.react(arrowRight);
			await msg.react(checkEmote);

			//Grab reactions from the inital message
			const reactions = await msg.awaitReactions(reaction => reaction.emoji.name == leftArr.name || reaction.emoji.name == arrowRight.name || reaction.emoji.name == checkEmote.name, {time: 15000, max: 2});
			try{ bgCountA = (reactions.get(leftArr.id).count - 1); }
				catch(e) { bgCountA = 0;}
			try{ bgCountB = (reactions.get(arrowRight.id).count - 1); }
				catch(e) { bgCountB = 0;}
			try{ bgCountC = (reactions.get(checkEmote.id).count - 1); }
				catch(e) { bgCountC = 0;}

			if(bgCountA >= 1)
			{
				if(_bg <= 0)
					_bg = available.length - 2;
				else
					_bg -= 2;

				msg.delete();
				continue;
			}
			else if(bgCountB >= 1)
			{
				if(_bg >= available.length - 1)
					_bg = -1;

				msg.delete();
				continue;
			}
			else if(bgCountC >= 1)
			{
				msg.delete();
				memberInfo.currentBG = available[_bg] - 1;
				message.author.send("Your background has successfully been updated!").then(msg => {msg.delete(5000)}).catch();

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberInfo);
				break;
			}
			else
			{
				msg.delete();
				break;
			}
		}
	}
	if(countB >= 1) //Achievements
	{
		if(!isAchievementsDisabled)
		{
			var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);
			var memberAchData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_achievement_data.sqlite`, "data", "id", message.author.id);

			var emote1 = client.emojis.get(moji1);
			var emote2 = client.emojis.get(moji2);
			var emote3 = client.emojis.get(moji3);
			var emote4 = client.emojis.get(moji4);
			var emote5 = client.emojis.get(moji5);
			var emote6 = client.emojis.get(moji6);
			var emote7 = client.emojis.get(moji7);

	        attachment = new Discord.Attachment(bgData[memberInfo.currentBG], 'bgImage.png');
			const achieveSettings = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setThumbnail(message.author.displayAvatarURL)
				.setDescription(`Which achievement slot would you like to edit?`)
				.setFooter(`Slots counts from left to right`)
				.setTimestamp()
				.attachFile(attachment)
	            .setImage('attachment://bgImage.png');

			var reactAchMsg = await message.author.send({embed:achieveSettings});
			await reactAchMsg.react(emote1);
			await reactAchMsg.react(emote2);
			await reactAchMsg.react(emote3);
			await reactAchMsg.react(emote4);
			await reactAchMsg.react(emote5);
			await reactAchMsg.react(emote6);
			await reactAchMsg.react(emote7);

			const achReactions = await reactAchMsg.awaitReactions(reaction => reaction.emoji.name == emote1.name || reaction.emoji.name == emote2.name || reaction.emoji.name == emote3.name || reaction.emoji.name == emote4.name || reaction.emoji.name == emote5.name || reaction.emoji.name == emote6.name || reaction.emoji.name == emote7.name, {time: 13000, max: 2});
			try{ achCount1 = (achReactions.get(emote1.id).count - 1); }
				catch(e) { achCount1 = 0;}
			try{ achCount2 = (achReactions.get(emote2.id).count - 1); }
				catch(e) { achCount2 = 0;}
			try{ achCount3 = (achReactions.get(emote3.id).count - 1); }
				catch(e) { achCount3 = 0;}
			try{ achCount4 = (achReactions.get(emote4.id).count - 1); }
				catch(e) { achCount4 = 0;}
			try{ achCount5 = (achReactions.get(emote5.id).count - 1); }
				catch(e) { achCount5 = 0;}
			try{ achCount6 = (achReactions.get(emote6.id).count - 1); }
				catch(e) { achCount6 = 0;}
			try{ achCount7 = (achReactions.get(emote7.id).count - 1); }
				catch(e) { achCount7 = 0;}

			//Grabbing available achievements
			var availableAch = [];
			for(var i = 1; i <= 7; i++)
			{
				var avail = await getSQLData(client, message, `ac${i}`, "ACH");
				if(avail)
					availableAch[availableAch.length] = i;
			}

			//Empty / Reset
			availableAch[availableAch.length] = 0;
			reactAchMsg.delete();
		}
		else
			message.author.send("Profile achievement settings are currently disabled.");
		if(achCount1 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot1`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 1, slotContents);
		}
		if(achCount2 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot2`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 2, slotContents);
		}
		if(achCount3 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot3`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 3, slotContents);
		}
		if(achCount4 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot4`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 4, slotContents);
		}
		if(achCount5 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot5`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 5, slotContents);
		}
		if(achCount6 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot6`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 6, slotContents);
		}
		if(achCount7 >= 1)
		{
			var slotContents = await getSQLData(client, message, `slot7`, "ACH");
			await slotsSettings(client, message, availableAch, memberAchData, 7, slotContents);

		}
	}
}

async function slotsSettings(client, message, availableAch, memberAchData, slot, slotContents)
{
	const leftArr = await client.emojis.get(leftMoji);
	const arrowRight = await client.emojis.get(rightMoji);
	const checkEmote = await client.emojis.get(checkMoji);

	for(_aci = 0; _aci < availableAch.length; _aci++)
	{
		attachment = new Discord.Attachment(achAddons[availableAch[_aci]], 'achImage.png');
		const achieveSettings = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
			.setThumbnail(message.author.displayAvatarURL)
			.setDescription(`Please select which achievement you would like to add`)
			.setFooter(`Viewing achievement ${_aci + 1} of ${availableAch.length}`)
			.setTimestamp()
			.attachFile(attachment)
			.setImage('attachment://achImage.png');

		var achIconPickMsg = await message.author.send({embed:achieveSettings});
		await achIconPickMsg.react(leftArr);
		await achIconPickMsg.react(arrowRight);
		await achIconPickMsg.react(checkEmote);

		const achPickingReactions = await achIconPickMsg.awaitReactions(reaction => reaction.emoji.name == leftArr.name || reaction.emoji.name == arrowRight.name || reaction.emoji.name == checkEmote.name, {time: 15000, max: 2});
		try{ achCountA = (achPickingReactions.get(leftArr.id).count - 1); } catch(e) { achCountA = 0;}
		try{ achCountB = (achPickingReactions.get(arrowRight.id).count - 1); } catch(e) { achCountB = 0;}
		try{ achCountC = (achPickingReactions.get(checkEmote.id).count - 1); } catch(e) { achCountC = 0;}

		if(achCountA >= 1)
		{
			if(_aci <= 0)
				_aci = availableAch.length - 2;
			else
				_aci -= 2;

			achIconPickMsg.delete();
			continue;
		}
		else if(achCountB >= 1)
		{
			if(_aci >= availableAch.length - 1)
				_aci = -1;

			achIconPickMsg.delete();
			continue;
		}
		else if(achCountC >= 1)
		{
			achIconPickMsg.delete();

			//Dupelication check
			for(var i = 1; i <= ACHIEVEMENT_COUNT; i++)
				await achievementDupeCheck(client, message, i, availableAch[_aci])

			var memberObject = Object.keys(memberAchData);
	        var memberObjectValues = Object.values(memberAchData);
			for(let i = 0; i < memberObject.length; i++)
				if(`slot${slot}` == memberObject[i])
				{
					memberObjectValues[i] = availableAch[_aci];
					break;
				}

			message.author.send("Your achievement slot has successfully been updated!").then(msg => {msg.delete(5000)}).catch();

			let merged = await sqlHand.merge(memberObject, memberObjectValues);
			await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, merged);
			break;
		}
		else
		{
			achIconPickMsg.delete();
			break;
		}
	}
}

async function achievementDupeCheck(client, message, slot, ach)
{
	let memberAchData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_achievement_data.sqlite`, "data", "id", message.author.id);

	let memberObject = Object.keys(memberAchData);
	let memberObjectValues = Object.values(memberAchData);
	for(let i = 0; i < memberObject.length; i++)
		if(`slot${slot}` == memberObject[i])
		{
			memberObjectValues[i] = 0;
			break;
		}

	//Save
	let merged = await sqlHand.merge(memberObject, memberObjectValues);
	await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, merged);
	return true;
}

async function getSQLData(client, message, data, type)
{
	switch(type)
	{
		case "BG":
			var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);

			var memberObject = Object.keys(memberInfo);
	        var memberObjectValues = Object.values(memberInfo);
			for(let i = 0; i < memberObject.length; i++)
				if(data == memberObject[i])
					return memberObjectValues[i];

			return undefined;
			break;
		case "ACH":
			var memberAchData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_achievement_data.sqlite`, "data", "id", message.author.id);

			var memberObject = Object.keys(memberAchData);
	        var memberObjectValues = Object.values(memberAchData);
			for(let i = 0; i < memberObject.length; i++)
				if(data == memberObject[i])
					return memberObjectValues[i];

			return false;
			break;
	}
}
