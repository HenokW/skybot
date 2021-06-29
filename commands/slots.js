const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

var minimumBet = 20;

//---EMOJI INFORMATION---//

var eggplantEmoji = '🍆'; //200
var starEmoji = '🌟'; //Wins based on what other losers have added into the bank
var cherryEmoji = '🍒'; //100 ea
var faceEmoji = '😃'; //250
var paddedEmoji = '❌' //X - emoji
//=======

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	var memberCInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	var casinoCInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/games/casino.sqlite`, "data", "id", message.guild.id);
	var gamesSheetCInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/games/users/gamesStats.sqlite`, "data", "id", message.author.id);

	if(memberCInfo.bal >= minimumBet)
	{
		gamesSheetCInfo.slotsBalLost += minimumBet;
		memberCInfo.bal -= minimumBet;
		try
		{
			var res = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setThumbnail("https://cdn3.iconfinder.com/data/icons/casino/256/Cherries-512.png")
				.setTimestamp();

			var slot1Result = await slotsNumRoll();
			var slot2Result = await slotsNumRoll();
			var slot3Result = await slotsNumRoll();

			if(slot1Result == slot2Result && slot2Result == slot3Result)
			{
				if(slot1Result == eggplantEmoji)
				{
					memberCInfo.bal += 200;
					memberCInfo.totalBal += 200;
					gamesSheetCInfo.slotsBalGain += 200;
					gamesSheetCInfo.slotsW++;
					gamesSheetCInfo.slotsEggMatch++;

					res.setDescription(`| ${slot1Result} : ${slot2Result} : ${slot3Result} |`)
						.addField(eggplantEmoji + " Eggplant Match! " + eggplantEmoji, message.author + ", has been awarded 200 Quarters!");
				}
				else if(slot1Result == starEmoji)
				{
					bonusReward = casinoCInfo.bank;
					casinoCInfo.bank = 0;

					memberCInfo.bal += bonusReward;
					memberCInfo.totalBal += bonusReward;
					gamesSheetCInfo.slotsBalGain += bonusReward;
					gamesSheetCInfo.slotsW++;
					gamesSheetCInfo.slotsStarMatch++;

					res.setDescription(`| ${slot1Result} : ${slot2Result} : ${slot3Result} |`)
						.addField(starEmoji + " BONUS REWARD!!! " + starEmoji, message.author + `, has been awarded **${bonusReward} QUARTERS**!`);
				}
				else if(slot1Result == cherryEmoji)
				{
					memberCInfo.bal += 100;
					memberCInfo.totalBal += 100;
					gamesSheetCInfo.slotsBalGain += 100;
					gamesSheetCInfo.slotsW++;
					gamesSheetCInfo.slotsCherryMatch++;

					res.setDescription(`| ${slot1Result} : ${slot2Result} : ${slot3Result} |`)
						.addField(cherryEmoji + " Cherry Match! " + cherryEmoji, message.author + ", has been awarded 100 Quarters!");
				}
				else if(slot1Result == faceEmoji)
				{
					memberCInfo.bal += 250;
					memberCInfo.totalBal += 250;
					gamesSheetCInfo.slotsBalGain += 250;
					gamesSheetCInfo.slotsW++;
					gamesSheetCInfo.slotsFaceMatch++;

					res.setDescription(`| ${slot1Result} : ${slot2Result} : ${slot3Result} |`)
						.addField(faceEmoji + " Face Match! " + faceEmoji, message.author + ", has been awarded 250 Quarters!");
				}
				else
					client.emit("error", `Casino error`);
			}
			else
			{
				gamesSheetCInfo.slotsL++;
				casinoCInfo.bank += Math.floor((minimumBet / 2) - (Math.random() * (minimumBet / 2)));

				res.setDescription(`| ${slot1Result} : ${slot2Result} : ${slot3Result} |`)
					.setFooter("The current Jackpot Bonus is: " + casinoCInfo.bank)
					.addField("No match unfortunately.", message.author + ", has lost " + minimumBet + " Quarters.");
			}

			message.channel.send({embed:res});

			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberCInfo);
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/games/casino.sqlite`, config.slotsSQLSetter, casinoCInfo);
			await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, gamesSheetCInfo);
		}
		catch(e) {client.emit("error", e);}
	}
	else
		message.channel.send(`${message.author}, you must have at least **${minimumBet} Quarters** to use the slot machine.`);

	message.channel.stopTyping();
}

function slotsNumRoll()
{
	max = 10;

	slotsRoll = Math.floor(Math.random() * (max - 1)) + 1;

	if(slotsRoll == 1 || slotsRoll == 7 || slotsRoll == 8)
		return eggplantEmoji;
	else if(slotsRoll == 2 || slotsRoll == 7)
		return starEmoji;
	else if(slotsRoll == 3 || slotsRoll == 5 || slotsRoll == 10)
		return cherryEmoji;
	else if(slotsRoll == 4 || slotsRoll == 6 || slotsRoll == 9)
		return faceEmoji;

	return paddedEmoji;
}
