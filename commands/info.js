const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	message.channel.startTyping();

	var guildInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/${guild.id}.sqlite`, "data", "guild", guild.id);
	var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

	time = client.uptime / 1000;
	hr = Math.floor(time / 3600);
	if(hr < 10)
		hr = "0" + hr;
	min = Math.floor((time % 3600) / 60);
	if(min < 10)
		min = "0" + min;
	sec = Math.floor((time % 3600) % 60);
	if(sec < 10)
		sec = "0" + sec;

	botCount = 0;
	for(_bc = 0; _bc < guild.members.array().length; _bc++)
		if(guild.members.array()[_bc].user.bot)
			botCount++;

	memberCount = guild.members.array().length - botCount;
	const infoEmbed = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(guild.name, guild.iconURL)
		.setThumbnail(guild.iconURL)
		.addField(`${guild.name} | Guild Info`,
			"**Owner: " + `<@${guild.owner.id}>` + "**\n" +
			"**Guild Prefix: `" + guildInfo.prefix + "`**\n" +
			"**Users: `" + memberCount + "`**\n" +
			"**Bots: `" + botCount + "`**\n" +
			"**Guild Roles: `" + guild.roles.array().length + "`**\n" +
			"**Channels & Dividers: `" + guild.channels.array().length + "`**\n" +
			"**Server Commands Sent: `" + guildInfo.commands_used + "`**\n" +
			"**Server Created: `" + `${guild.createdAt}` + "`**\n")

		.addBlankField()
		.addField(`${message.author.username}#${message.author.discriminator} | User Info`,
			"**Level: `" + memberInfo.level + "`**\n" +
			"**EXP: `" + memberInfo.exp + "`**\n" +
			"**Balance: `$" + memberInfo.bal + "`**\n" +
			"**Lifetime Balance: `$" + memberInfo.totalBal + "`**\n" +
			//"**Vault: `$" + memberInfo.vault + "`**\n" +
			"**Messages Sent: `" + memberInfo.messages_sent + "`**\n" +
			"**My Commands Sent: `" + memberInfo.commands_used + "`**\n" +
			"**Crates Opened: `" + memberInfo.openedCrates + "`**\n" +
			"**Created On: `" + message.author.createdAt + "`**\n")
		.setFooter(`Bot uptime: ${hr}:${min}:${sec}`)
		.setTimestamp();

		message.channel.send({embed:infoEmbed});
		message.channel.stopTyping();
}
