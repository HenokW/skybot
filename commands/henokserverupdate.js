const Discord = require("discord.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	//Nope :)
	if(message.author.id != '148278118170361857')
		return message.channel.send(`${message.author}, hey! This secret command is **not** for you!`);

	let guilds = client.guilds.find('id', '346430947421323267');
	let updatesChannel = guilds.channels.find('id', '346435709776691200');

	const servUpdate = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(client.user.username + "#" + client.user.discriminator, client.user.displayAvatarURL)
		.setFooter("Future updates")
		.setThumbnail(client.user.displayAvatarURL)
		.setTimestamp()
		.setTitle("<:staff_emotes:560265410956492809> Future updates <:staff_emotes:560265410956492809>")
		.setDescription("**Hey there folks!**\n" +
			"Just a quick notice: past,and future updates will now be available under the **`updates`** command. Feel free to check it out, and view my history!\n\nNow with that out of the way, here's my final annoying update message:\n\n" +

			// "__**Additions | Upcoming:**__\n" +
			// "**+ Music features! -** You can now use me to play YouTube tracks! For more information, please use the `help` command.\n\n" +

			"__**Fixes & Changes**__\n" +
			"**+** Database changes! There should now be fewer issues with commands that require access to any database.\n" +
			"**+** Achievements have been unlocked! Earn, and customize your profile with unlocked achievements through your profile settings.\n" +
			"**+** Several bugs squashed with the changes mentioned above.\n" +
			"**+** Various poll related bugs have been fixed.\n" +
			"**+** The shop's crate prices have been reduced.\n\n" +

			"If you happen to run into any issues, please let <@148278118170361857> know!");

	message.delete();
	updatesChannel.send({embed:servUpdate});
}
