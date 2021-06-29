/*
=== Credits to Taivop ===
- Using random jokes from their reddit page
https://github.com/taivop/joke-dataset
*/

const Discord = require("discord.js");
const debugText = false;

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	client.reddit_jokes = require ("./utils/reddit_jokes.json");
	var totalJokes = client.reddit_jokes.length;
	var randomJoke = client.reddit_jokes[Math.floor(Math.random() * totalJokes)];
	while(randomJoke.body == "" || randomJoke.body.length > 1023)
		var randomJoke = client.reddit_jokes[Math.floor(Math.random() * totalJokes)];

	debug(randomJoke);
	const jokeEmbed = new Discord.RichEmbed()
		.setColor("#ffb749")
		.setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
		.addField(randomJoke.title, randomJoke.body)
		.setFooter(`Reddit score: ${randomJoke.score}`)
		.setTimestamp();

	message.channel.send({embed:jokeEmbed});
	message.channel.stopTyping();
}

function debug(msg)
{
	console.log(`*** REDDIT JOKE ***\n${msg.title}************`);
}
