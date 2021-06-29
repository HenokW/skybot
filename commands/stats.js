const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

var eggplantEmoji = '🍆'; //200
var starEmoji = '🌟'; //Wins based on what other losers have added into the bank
var cherryEmoji = '🍒'; //100 ea
var faceEmoji = '😃'; //250
var paddedEmoji = '❌' //X - emoji

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{//<:minus:560293563615936513>
	var statsInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/games/users/gamesStats.sqlite`, "data", "id", message.author.id);

	var myStats = new Discord.RichEmbed()
		.setColor("#2489bE")
    	.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
    	.addField("Gaming stats",
    		`<:gre_uparrow:560293561493356565> **Slot Wins:** ${statsInfo.slotsW}\n` +
    		`<:red_downarrow:560293563393376257> **Slot Losses:** ${statsInfo.slotsL}\n` +
    		`- **Face Match:** ${statsInfo.slotsFaceMatch}\n` +
    		`- **Eggplant Match:** ${statsInfo.slotsEggMatch}\n` +
    		`- **Cherry Match:** ${statsInfo.slotsCherryMatch}\n` +
    		`- **Star Match:** ${statsInfo.slotsStarMatch}\n\n` +

    		`<:gre_uparrow:560293561493356565> **Gamble Wins:** ${statsInfo.gambleW}\n` +
    		`<:red_downarrow:560293563393376257> **Gamble Losses:** ${statsInfo.gambleL}\n` +
    		`- **Balance Gained:** ${statsInfo.gambleBalGain}\n` +
    		`- **Balance Lost:** ${statsInfo.gambleBalLost}\n\n` +

			`<:gre_uparrow:560293561493356565> **Race Wins:** ${statsInfo.raceW}\n` +
			`<:red_downarrow:560293563393376257> **Race Losses:** ${statsInfo.raceL}\n\n` +

			`<:gre_uparrow:560293561493356565> **TypeRacer Wins:** ${statsInfo.typeraceW}`)
    	.setFooter("Gaming stats sheet")
    	.setTimestamp();

    await message.channel.send(message.author + ", here are your stats.");
	message.channel.send({embed:myStats});
}
