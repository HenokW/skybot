const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

var worked_emote = "<:success_emote:567699131733245992>";
var failed_emote = "<:warning_emote:559030535540834324>";
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, config) =>
{
    if(!message.member.hasPermission("ADMINISTRATOR") && message.author.id != '148278118170361857') return;

    if(args[0] == "remove")
        return disableSuggestions(client, message);
    try { mentionedChannel = message.mentions.channels.first(); } catch(e) { mentionedChannel = undefined; }

    if(mentionedChannel == undefined || mentionedChannel == null) //No other arg passed
        return message.channel.send(`${failed_emote} ${message.author}, you've provided an invalid channel. Please tag a channel you would like to use as your suggestions channel.`);

    addSuggestionsChannel(client, message, mentionedChannel);
}

async function disableSuggestions(client, message)
{
    //Saving Guild data
    var guildSettings = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);
    if(guildSettings.suggestions_channel == null)
        returnMessage(client, message, `${failed_emote} ${message.author},` + " There doesn't seem to be a suggestions channel to disable! If you would like to use this feature, please enable a suggestions channel by usings the **`suggestions #channel`** command.");
    else
    {
        guildSettings.suggestions_channel = null;
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildSettings);
        return returnMessage(client, message,`${worked_emote} ${message.author},` + " has successfully disabled the suggestions feature.");
    }
}

async function addSuggestionsChannel(client, message, suggChannel)
{
    //Saving Guild data
    var guildSettings = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);

    guildSettings.suggestions_channel = suggChannel.id;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, guildSettings);

    returnMessage(client, message, `${worked_emote} ${suggChannel}, has successfully been set as your default suggestions channel!`);
}

function returnMessage(client, message, msg)
{
    var returnMsg = new Discord.RichEmbed()
        .setColor("be243e")
        .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
        .setDescription(msg);

    return message.channel.send({embed:returnMsg});
}
