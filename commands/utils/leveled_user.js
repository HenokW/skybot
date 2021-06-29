const Discord = require("discord.js");
const canvas = require('canvas');
const snekfetch = require('snekfetch');
const SQLite = require("better-sqlite3");
const fs = require("fs");

var myBG = "./resources/levelup.png";

var profile_width = 100;
var profile_height = 100;

//--------PROFILE ADDONS--------
var newCrate = './resources/prof_addons/new_crate.png';
var crateTier = './resources/prof_addons/tier_dot.png';
var crateTierEmpty = './resources/prof_addons/tier_dot_empty.png';
//=======================================================================

//leveled_icon.run(client, message, guildPrefix, config, memberInfo.level);
module.exports.run = async(client, message, guildPrefix, confi, userLevel) =>
{
	//Let's try to grab their nicknme first (if they have one)
	var name = message.author.lastMessage.member.nickname;
	if(!name) name = message.author.username;

	//Sets up the canvas
	var myProfileCanvas = canvas.createCanvas(profile_width, profile_height);
	var cptx = myProfileCanvas.getContext('2d');

	//Grab user data
	var membersSQL = new SQLite(`./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`);
	client.getMemberData = membersSQL.prepare("SELECT * FROM data WHERE id = ?");
	var memberData = client.getMemberData.get(message.author.id);

	//-----------
	//User avatar
	var user_currBG = await canvas.loadImage(myBG);
	var newCrateIcon = await canvas.loadImage(newCrate);
	var tierIcon = await canvas.loadImage(crateTier);
	var tierIconEmpty = await canvas.loadImage(crateTierEmpty);

	cptx.clearRect(0, 0, profile_width, profile_height);
	cptx.drawImage(user_currBG, 0, 0, myProfileCanvas.width, myProfileCanvas.height);
	//cptx.drawImage(newCrateIcon, 7, myProfileCanvas.height - 30, 30, 15); //Very bottom

	cptx.font = '13px Biko';
	cptx.textAlign = 'center';
	cptx.fillStyle = '#ffffff';
	cptx.fillText(`LEVELED  UP!`, Math.floor(myProfileCanvas.width / 2), 18);
	cptx.fillText(`Level - ${userLevel}`, Math.floor(myProfileCanvas.width / 2), myProfileCanvas.height - 10);

	//Prof pic shape
	cptx.beginPath();
	//Starts the arc to form a circle
	//(X, Y, Radius, Start angle, End angle, counterclockwise)
	cptx.arc(profile_width / 2, (profile_height / 2) - 15, 37, 0, Math.PI * 2, false);
	// cptx.stroke();
	cptx.closePath();
	//Clips the drawn region
	cptx.clip();

	var { body: buffer } = await snekfetch.get(message.author.displayAvatarURL);
	var userAva = await canvas.loadImage(buffer);

	cptx.drawImage(userAva, (profile_width / 2) - (profile_width / 4), (profile_height / 2) - (profile_height / 4), 50, 50); //X, Y, Constrain X, Constrain Y
	var testImage = new Discord.Attachment(myProfileCanvas.toBuffer(), 'levelup.png');
	message.channel.send(`<:plus1_emote:580097461637611521> **| ${name} has LEVELED UP!**`, testImage);

	
	membersSQL.close();
}