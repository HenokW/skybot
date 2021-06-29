const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

var minimumMulti = .01;

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();
	try
	{
		gambleAmount = Math.floor(args.shift() * 1);
		if(gambleAmount * 0 == 0)
		{
			var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
			var gamesSheetCInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/games/users/gamesStats.sqlite`, "data", "id", message.author.id);

			betAmountMin = Math.floor(memberInfo.bal * minimumMulti);
			if(betAmountMin <= 0)
				betAmountMin = 1;

			if(gambleAmount <= memberInfo.bal && gambleAmount >= betAmountMin)
			{
				//Win rolling
				winRole = Math.floor(Math.random() * 3) + 1;
				if(winRole == 1)
				{
					gamesSheetCInfo.gambleW++;
					gamesSheetCInfo.gambleBalGain += gambleAmount;

					winWords = await randomWinPhrase();
					gambleResults(message, winWords + "! You've won! Your balance is now: **" + (memberInfo.bal + gambleAmount) + " Quarters**.");
					memberInfo.bal += gambleAmount * 1;
					memberInfo.totalBal += gambleAmount * 1;

					await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				}
				else
				{
					gamesSheetCInfo.gambleL++;
					gamesSheetCInfo.gambleBalLost += gambleAmount;

					gambleResults(message, "Unfortunatley you've lost. Your balance is now: **" + (memberInfo.bal - gambleAmount) + " Quarters**.");
					memberInfo.bal -= gambleAmount * 1;

					await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
				}

				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, gamesSheetCInfo);
				await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
			}
			else
				message.channel.send(message.author + ", you can only gamble **" + betAmountMin + "** to **" + memberInfo.bal + " Quarters.**");
		}
		else
			message.channel.send(message.author + ", please enter an amount to gamble.");
	}
	catch(e) { message.channel.send(message.author + ", please enter an amount to gamble."); }

	message.channel.stopTyping();
}

function randomWinPhrase()
{
	wins = ["Congrats", "Happy days", "Weeeeee", "Lucky you", "Fun times", "Payout time", "$$$$", "Winner, winner", "Money time"];
	picked = Math.floor(Math.random() * wins.length);

	return wins[picked];
}

function gambleResults(message, results)
{
	const gambleRes = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
		.setThumbnail("https://cdn3.iconfinder.com/data/icons/casino/256/Cherries-512.png")
		.setFooter("Gamble responsibly")
		.addField("Gambling results", message.author + ", " + results)
		.setTimestamp();
	message.channel.send({embed:gambleRes});
}
