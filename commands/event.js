const Discord = require("discord.js");
const config = require("../config.json");
const message_man = require("./utils/message_manager.js");
const fs = require("fs");
const sqlHand = require("./utils/sql_handler.js");

//---
//var POLL_LIMIT = 3;
//---
var yes_emote = "567699131733245992>"; //Green dot
var no_emote = "559030535540834324"; //Red dot

var worked_emote = "<:success_emote:567699131733245992>";
var failed_emote = "<:warning_emote:559030535540834324>";
var question_emote = "<:question_emote:595676254905171978>";

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    //If the user does not have Administrator perms
    if(!message.member.hasPermission("ADMINISTRATOR")) return;

    //What they would like to do with the polls command
    let option = args[0];
    switch(option)
    {
        case "create":
            let eventsChannel = await getEventsChannel(client, message, false);
            if(eventsChannel == false)
                return returnMessage(client, message, `${failed_emote} you don't have an events channel specified yet.` + "Please specify a channel using the **`" + guildPrefix + "event <#channel>`** command.");
            else
                await createEvent(client, message, args, eventsChannel, []);
            break;
        case "end":
            let eventID = args[1];
            message_man.stop(client, message, eventID);
            break;
        case "help":
            let eventHelp = new Discord.RichEmbed()
                .setColor("#be243e")
                .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
                .setTitle("Poll Commands List")
                .addField("Commands:",
                "**`" + guildPrefix + "event <#channel>`** - Direct where created event signups are displayed\n\n" +

                "**`" + guildPrefix + "event create <duration>`** - Creates a new event signup\n" +
                "**`" + guildPrefix + "event end <id>`** - Removes an existing poll\n")

                .addField("Options help:",
                "**Valid event durations:** <s>, <m>, <h>, and <d> (Seconds, Minutes, Hours, and Days).\n\n" +

                "**Example command:** `event create 5m`");

                message.reply({embed:eventHelp});
            break;

        case "cancel":
            break;

        default:
            if(message.mentions.channels.first() != null)
            {
                let newEventsChannel = message.mentions.channels.first();
                await addEventsChannel(client, message, newEventsChannel);
            }
            else
                return returnMessage(client, message, `${failed_emote} please specify an event option (e.g. create, end, help).`);
    }
}

/*
== (info) - contents ==
[0] - Description
[1] - Time info
*/

async function createEvent(client, message, args, eventsChannel, eventInfo)
{
    //Let's test to make sure the polls channel exists
    try {
        eventsChannelCheck = await client.channels.get(eventsChannel);
        if(eventsChannelCheck == undefined || eventsChannelCheck == null) throw "Undefined channel provided";
    } catch(e) {
        await getEventsChannel(client, message, true);
        return returnMessage(client, message, `${failed_emote} your events channel doesn't seem to exist anymore. Please specify a new events channel.`);
    }

    //The type of event that's needed to create
    let type = "event";
    let delay = 120000; //time in milliseconds

    if(eventInfo.length == 0)
        await message.reply("What would you like the description of your event to be?");
    else if(eventInfo.length == 1)
        await message.reply("What is the time details for your event (ex: Jan 12th @7PM CST)?");

    var mcCollector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: delay, errors:['time']});
    mcCollector.once('collect', async info =>
    {
        //Ends the current process
        let collArgs = info.content.slice(0).trim().split(' ');
        if(collArgs[1] != 'cancel')
        {
            eventInfo[eventInfo.length] = info.content;
            if(eventInfo.length < 2) createEvent(client, message, args, eventsChannel, eventInfo);
            else
            {
                let eventEmbed = new Discord.RichEmbed()
                    .setColor("#2489be")
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
                    .setTitle("Event signup")
                    .setDescription(`${eventInfo[0]}\n\n **When: **${eventInfo[1]}\n\n` +
                        `${worked_emote} **- Attending**\n${failed_emote} **- Not Attending**\n${question_emote} **- Undecided**`)
                    .setFooter("Time remaining: 00:00:00");
                client.channels.get(eventsChannel).send({embed:eventEmbed}).then(async msg =>
                {
                    await msg.react(client.emojis.get("567699131733245992")); //Green
                    await msg.react(client.emojis.get("559030535540834324")); //Red
                    await msg.react(client.emojis.get("595676254905171978")); //Question

                    message_man.add(client, msg, "event", args[1], message);
                }).catch(err => { returnMessage(client, message, `${failed_emote} uh-oh! Looks like I don't have permission to talk in <#${eventsChannel}>.`); });
            }
        }
        else
            message.channel.send(`${worked_emote} ${message.author}, event creation has successfully been cancelled.`);
    });

    mcCollector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} An event creation has timed out due to inactivity.`); });
}

async function getEventsChannel(client, message, reset)
{
    let data = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);
    if(!reset)
    {
        let returnData = undefined;
        if(data.events_channel == null)
            returnData = false;
        else
            returnData = data.events_channel;

        return returnData;
    }
    else
    {
            data.events_channel = null;
            await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, data);
            return;
    }
}

async function addEventsChannel(client, message, newEventsChannel)
{
    //Saving Guild data
    let data = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);

    data.events_channel = newEventsChannel.id;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, data);

    returnMessage(client, message, `${worked_emote} ${newEventsChannel} has successfully been set as your default events channel!`);
}

function returnMessage(client, message, msg)
{
    var returnMsg = new Discord.RichEmbed()
        .setColor("be243e")
        .setDescription(msg);

    return message.reply({embed:returnMsg});
}
