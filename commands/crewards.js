const Discord = require("discord.js");
const config = require("../config.json");

var leftMoji = '572584617337552945';
var rightMoji = '572584617681485835';

crateIcons = './resources/crate.png';

tierTitle = [];
tierTitle[0] = "Tier-I Crate Rewards";
tierTitle[1] = "Tier-II Crate Rewards";
tierTitle[2] = "Tier-III Crate Rewards";

tierText = [];
tierText[0] = "**- Quarters:**\n" +
				"\t(1 - 500) - Chance: 70%\n" +
				"\t(500 - 2500) - Chance: 12%\n" +
				"\t(1000 - 5000) - Chance: 1%\n\n" +
			"**- Profile Backgrounds (2)** - Chance: 4%\n" +
			"**- No Reward** - Chance: 9%\n";

tierText[1] = "**- Quarters:**\n" +
				"\t(250 - 750) - Chance: 55%\n" +
				"\t(750 - 2750) - Chance: 15%\n" +
				"\t(1000 - 5000) - Chance: 2.5%\n\n" +
			"**- Various Profile Backgrounds** (6) - Chance: 3% (per bg)\n" +
			"**- No Reward** - Chance: 5%\n";

tierText[2] = "**- Quarters:**\n" +
				"\t(250 - 1000) - Chance: 50%\n" +
				"\t(1000 - 5000) - Chance: 15%\n" +
				"\t(5000 - 7500) - Chance: 7%\n\n" +
			"**- Various Profile Backgrounds** (7) - Chance: 2% - 5% (per bg)\n" +
			"**- No Reward** - Chance: 3%\n";


module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	const leftArr = client.emojis.get(leftMoji);
	const arrowRight = client.emojis.get(rightMoji);

	message.channel.startTyping();

	finished_crates:
	for(_cr = 0; _cr < 3; _cr++)
	{
		attachment = new Discord.Attachment(crateIcons, 'bgImage.png');
		const infoEmbed = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
			.attachFile(attachment)
	        .setThumbnail('attachment://bgImage.png')
	        .setFooter("Feeling lucky?")
			.addField(tierTitle[_cr], tierText[_cr])
			.setTimestamp();

		let crateRewardsMSG = await message.channel.send({embed:infoEmbed});
		await crateRewardsMSG.react(leftArr);
		await crateRewardsMSG.react(arrowRight);

		const reactions = await crateRewardsMSG.awaitReactions(reaction => reaction.emoji.name == leftArr.name || reaction.emoji.name == arrowRight.name, {time: 10000, max: 2});
		try{ countCA = (reactions.get(leftArr.id).count - 1); }
			catch(e) { countCA = 0;}
		try{ countCB = (reactions.get(arrowRight.id).count - 1); }
			catch(e) { countCB = 0;}

		if(countCA >= 1)
		{
			crateRewardsMSG.delete();
			if(_cr <= 0)
				_cr = 1;
			else
				_cr -= 2;

			continue;
		}
		else if(countCB >= 1)
		{
			crateRewardsMSG.delete();
			if(_cr >= 3)
				_cr = -1;

			continue;
		}
		else
		{
			// crateRewardsMSG.delete();
			await crateRewardsMSG.clearReactions();
			break finished_crates;
		}
	}
	message.channel.stopTyping();
}
