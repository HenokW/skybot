const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	client.bannedWordsList = require ("./utils/banned_words.json");

	message.channel.startTyping();

	path = args.shift();
	if(path == "add")
	{
		word = args.shift().toLowerCase();
		for(i = 0; i < client.bannedWordsList["words"].length; i++)
		{
			if(word == client.bannedWordsList["words"][i])
			{
				errorMsg(client, message, "This word has already been added to the list", Discord);
				return;
			}
		}
		client.bannedWordsList["words"][client.bannedWordsList["words"].length] = word;
		await fs.writeFile ("./admin_control/utils/banned_words.json", JSON.stringify(client.bannedWordsList, null, 4), err => 
		{
			if(err) throw err;
		})

		const embed = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(`${message.guild.name} || Banned Words`, message.guild.iconURL)
			.setThumbnail(message.guild.iconURL)
			.addField("A word has been added to the list", word)
			.setFooter("Be cautions when adding words, any messages containing these words will be punished!")
			.setTimestamp();
		message.channel.send({embed});
	}
	else if(path == "remove")
	{
		found = false;
		word = args.shift().toLowerCase();
		for(i = 0; i < client.bannedWordsList["words"].length; i++)
		{
			if(client.bannedWordsList["words"][i] == word)
			{
				found = true;
				client.bannedWordsList["words"].splice(i, 1);
			}
		}
		const embed = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(`${message.guild.name} || Banned Words`, message.guild.iconURL)
			.setThumbnail(message.guild.iconURL)
			.setFooter("Be cautions when removing words, any messages containing these words will be punished!")
			.setTimestamp();
		if(found)
		{
			embed.addField("A word has been removed from the list", word);
			await fs.writeFile ("./admin_control/utils/banned_words.json", JSON.stringify(client.bannedWordsList, null, 4), err => 
			{
				if(err) throw err;
			})
		}
		else
			embed.addField("I was unable to find the word", word);

		message.channel.send({embed});
	}
	else if(path == "list")
	{
		words = "";
		for(i = 0; i < client.bannedWordsList["words"].length; i++)
			words = words + client.bannedWordsList["words"][i] + ', ';

		const embed = new Discord.RichEmbed()
			.setColor("#be243e")
			.setAuthor(`${message.guild.name} || Banned Words`, message.guild.iconURL)
			.setThumbnail(message.guild.iconURL)
			.addField("Words", words)
			.setFooter("Any messages containing these words will be punished!")
			.setTimestamp();

		message.channel.send({embed});
	}
	else
	{
		errorMsg(client, message, "Incorrect arguments. To use this command you must either follow up with, `add` or `remove`.\nEx:`PREFIX.words add <WORD>`", Discord);
	}

	message.channel.stopTyping();
}


function errorMsg(client, message, msg, Discord)
{
	const embed = new Discord.RichEmbed();
	embed.setColor("#FF8000")
		.setDescription(msg);

	message.channel.stopTyping();
	message.channel.send({embed});
}