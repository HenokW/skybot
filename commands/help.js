const Discord = require("discord.js");

config = undefined;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    config = confi;
	message.channel.startTyping();

    const embed = new Discord.RichEmbed()
    .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
    .setColor("#be243e")
    .addField("Want to help us?", "If you find any errors, don't be afraid to message a staff member.\n** **")
    .addField("Have an idea?", "If you have any ideas for us, feel free to use our suggestions channel!\n** **")
    .addBlankField()
    .addField("Dev", `<:twitter:528807292305408030> [Henok](https://twitter.com/stupidsedits)`, true)
    .addField("Developed for", `<:discord:528808847671033867> [T.O.G. Network](https://discord.gg/AxcJEqh)`, true)
    .addField("Want to donate to me?", "<:pplogo384:539150609593532417> [Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=EQD8GU6SS6324&currency_code=USD&source=url)")
    .setTimestamp()
    .setFooter(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL);

    message.channel.send(message.author + ", Please check your DMs!");
    message.channel.send({embed});
    message.channel.stopTyping();

    profileCommands(client, message, guildPrefix);
}

async function profileCommands(client, message, guildPrefix)
{
    const profEmbed = new Discord.RichEmbed()
    .setTitle("Commands prefix:")
    .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
    .setDescription("Prefix: " + guildPrefix)
    .setColor("#2489be")
    .addField("<:profile_emote:560265411162144770> Profile Related Commands:",
        "**`" + guildPrefix + "profile`** - View your profile.\n" +
        "**`" + guildPrefix + "profile <@user>`** - View another users profile.\n" +
        "**`" + guildPrefix + "profile settings`** - Edit your profile settings.\n" +
        "**`" + guildPrefix + "stats`** - View your casino stats.\n" +
        "**`" + guildPrefix + "levels`** - Lists the top 10 levels.\n" +
        "**`" + guildPrefix + "info`** - Displays Guild & User info.\n");

    await message.author.send({embed:profEmbed});
    economyCommands(client, message, guildPrefix);
}

async function economyCommands(client, message, guildPrefix)
{

    const ecoEmbed = new Discord.RichEmbed()
    .setColor("#3abe24")
    .addField("<:economy_emote:560265409631092767> Economy Related Commands:",
        "**`" + guildPrefix + "shop`** - To open & preview the shop.\n" +
        "**`" + guildPrefix + "shop buy <id> <amount>`** - To purchase an item from the shop.\n" +
        "**`" + guildPrefix + "bal`** - View your balance.\n" +
        "**`" + guildPrefix + "daily`** - Claim a daily crate every 24hrs.\n" +
        "**`" + guildPrefix + "work`** - Get free quarters every 6hrs.\n" +
        "**`" + guildPrefix + "weekly`** - Get a free weekly pack!\n" +
        "**`" + guildPrefix + "crewards`** - Lists available rewards within each crate.\n" +
        "**`" + guildPrefix + "open`** - Access your crates inventory.\n" +
        //"**`" + guildPrefix + "c2open`** - Open one of your Tier-II crates.\n" +
        //"**`" + guildPrefix + "c3open`** - Open one of your Tier-III crates.\n" +
        "**`" + guildPrefix + "baltop`** - Lists the top 10 Balances.\n");

    await message.author.send({embed:ecoEmbed});
    gamemodeCmds(client, message, guildPrefix);
}

async function gamemodeCmds(client, message, guildPrefix)
{
    const gamesEmbed = new Discord.RichEmbed()
    .setColor("#8924be")
    .addField("<:gamemode_emote:560265411589963796> Game Related Commands:",
        "**`" + guildPrefix + "hl`** - General High or Low information.\n" +
        "**`" + guildPrefix + "hl top`** - High or Low streaks leaderboard.\n" +
        "**`" + guildPrefix + "hl start`** - Starts a game of High or Low.\n" +
        "**`" + guildPrefix + "race`** - General Random Racing information.\n" +
        "**`" + guildPrefix + "race start`** - Starts a Random Racing game.\n" +
        "**`" + guildPrefix + "typerace`** - General Type Racing information.\n" +
        "**`" + guildPrefix + "typerace start`** - Starts a Type Racing game.\n" +
        "**`" + guildPrefix + "gamble <amount>`** - Gamble away your quarters & try to double them!\n" +
        "**`" + guildPrefix + "slots`** - Take a crack at the slots machine.\n" +
        "**`" + guildPrefix + "stats`** - Returns your game stats.");

    await message.author.send({embed:gamesEmbed});
    musicCommands(client, message, guildPrefix);
}

async function musicCommands(client, message, guildPrefix)
{
    const musicEmbed = new Discord.RichEmbed()
    .setColor("#a75120")
    .addField("<:music_emotes:568055600861151262> Music Related Commands:",
        "**`" + guildPrefix + "play <url>`** - Adds your YouTube url to the queue.\n" +
        "**`" + guildPrefix + "remove <position>`** - Removes a track from the queue based on it's position.\n" +
        "**`" + guildPrefix + "queue`** - Returns everything in the queue.\n" +
        "**`" + guildPrefix + "skip`** - Skips the current track.\n" +
        "**`" + guildPrefix + "pause`** - Pauses the player.\n" +
        "**`" + guildPrefix + "leave`** - Leaves the Voice Channel.");

    await message.author.send({embed:musicEmbed});
    miscCommands(client, message, guildPrefix);
}

async function miscCommands(client, message, guildPrefix)
{
    const miscEmbeds = new Discord.RichEmbed()
    .setColor("#525252")
    .addField("<:misc_emotes:560265411120070657> Miscellaneous Commands:",
        "**`" + guildPrefix + "ping`** - PONG!\n" +
        "**`" + guildPrefix + "updates`** - View the bot's update history.\n" +
        "**`" + guildPrefix + "dice`** - Roll a 6-sided dice.\n" +
        "**`" + guildPrefix + "flip`** - Flip a coin.\n" +
        "**`" + guildPrefix + "whois <id>`** - Returns a user based on a given ID.\n" +
        "**`" + guildPrefix + "joke`** - Returns a random reddit joke.\n");

    await message.author.send({embed:miscEmbeds});
    adminCommands(client, message, guildPrefix);
}

async function adminCommands(client, message, guildPrefix)
{
     const adminEmbed = new Discord.RichEmbed()
    .setColor("#be243e")
    .addField("<:staff_emotes:560265410956492809> Staff Commands:", "Admins, and certain staff roles are only allowed to use these commands.")
    .addField("Economy-based Commands:",
        "**`" + guildPrefix + "donate <user> <amount>`** - Gives a user #-Quarters\n" +
        "**`" + guildPrefix + "withdraw <user> <amount>`** - Removes #-Quarters from a user\n" +
        "**`" + guildPrefix + "cgive <user> <#>`** - Gives a users #-crates\n" +
        "**`" + guildPrefix + "c2give <user> <#>`** - Gives a users #-Tier II crates\n" +
        "**`" + guildPrefix + "c3give <user> <#>`** - Gives a users #-Tier III crates\n" +
        "**`" + guildPrefix + "cremove <user> <#>`** - Removes #-crates from a user\n" +
        "**`" + guildPrefix + "c2remove <user> <#>`** - Removes #-Tier II crates from a user\n" +
        "**`" + guildPrefix + "c3remove <user> <#>`** - Removes #-Tier III crates from a user\n\n")

    .addField("Server Commands:",
        "**`" + guildPrefix + "suggestions <#channel>`** - Gives your suggestion channel more life\n" +
        "**`" + guildPrefix + "suggestions remove`** - Gives your suggestion channel less life\n" +
        "**`" + guildPrefix + "poll <#channel>`** - Direct where created polls are displayed\n" +
        "**`" + guildPrefix + "poll help`** - Returns all of the available poll related commands\n" +
        "**`" + guildPrefix + "event <#channel>`** - Direct where created signups are displayed (Poll type)\n" +
        "**`" + guildPrefix + "event help`** - Returns all of the available event related commands (Poll type)\n\n" +

        "**`" + guildPrefix + "events`** - Returns the server's event settings\n" +
        "**`" + guildPrefix + "events settings`** - Modify the guilds event settings\n" +
        "**`" + guildPrefix + "events help`** - A list displaying all of events command options\n\n" +

        "**`" + guildPrefix + "words add <word>`** - Adds a word to the ban list\n" +
        "**`" + guildPrefix + "words remove <word>`** - Deletes a word from the ban list\n" +
        "**`" + guildPrefix + "words list`** - Returns all the words in the ban list\n\n" +

        "**`" + guildPrefix + "ban <user> <reason>`** - Bans a user\n" +
        "**`" + guildPrefix + "kick <user> <reason>`** - Kicks a user\n" +
        "**`" + guildPrefix + "warn <user> <reason>`** - Warns a user\n" +
        //"**`" + guildPrefix + "plog [user]`** - Returns a users offenses\n" +
        "**`" + guildPrefix + "setprefix <prefix>`** - Set a new prefix\n")

    .addBlankField()
    .addField("Want to help us?", "If you find any errors, don't be afraid to message a staff member.\n** **")
    .addField("Have an idea?", "If you have any ideas for us, feel free to use our suggestions channel!\n** **")
    .addBlankField()
    .addField("Dev", `<:twitter:528807292305408030> [Henok](https://twitter.com/stupidsedits)`, true)
    .addField("Developed for", `<:discord:528808847671033867> [T.O.G. Network](https://discord.gg/AxcJEqh)`, true)
    .addField("Want to donate to me?", "<:pplogo384:539150609593532417> [Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=EQD8GU6SS6324&currency_code=USD&source=url)")
    .setTimestamp()
    .setFooter(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL);

    await message.author.send({embed:adminEmbed});
}
