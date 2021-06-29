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

var numEmotes = ['<:num1:572583074072887306>', '<:num2:572583074441854976>',
                '<:num3:579508950118957063>', '<:num4:579508952090279960>',
                '<:num5:579508952622956554>', '<:num6:579508952652316691>',
                '<:num7:579508952484675596>', '<:num8:579508952702648360>', '<:num9:579508952463835147>'];


var numEmotesID = ['572583074072887306', '572583074441854976',
                '579508950118957063', '579508952090279960',
                '579508952622956554', '579508952652316691',
                '579508952484675596', '579508952702648360', '579508952463835147'];
//---

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    //If the user does not have Administrator perms
    if(!message.member.hasPermission("ADMINISTRATOR")) return;

    //What they would like to do with the polls command
    let option = args[0];

    switch(option)
    {
        case "create":
            //if(await maxPollCount(client, message)) return message.reply(`you have more than **${POLL_LIMIT} Polls** active at once. Please end an active poll, or wait for an active poll to finish.`);
            var pollsChannel = await getPollChannel(client, message, false);
            if(pollsChannel == false) return returnMessage(client, message, `${failed_emote} you don't have a polls channel specified yet.` + "Please specify a channel using the **`" + guildPrefix + "poll <#channel>`** command.");
            else
                await createPoll(client, message, args, pollsChannel);
            break;
        case "end":
            var pollID = args[1];
            message_man.stop(client, message, pollID);
            break;
        case "help":
            let pollHelp = new Discord.RichEmbed()
                .setColor("#be243e")
                .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
                .setTitle("Poll Commands List")
                .addField("Commands:",
                "**`" + guildPrefix + "poll <#channel>`** - Direct where created polls are displayed\n\n" +

                "**`" + guildPrefix + "poll create <type> <duration>`** - Creates a new type of poll\n" +
                "**`" + guildPrefix + "poll end <id>`** - Removes an existing poll\n")

                .addField("Options help:",
                "**Valid poll types:**\n<yn> - Yes | No Poll\n<mc> - Multiple Choice Poll\n\n" +
                "**Valid poll durations:** <s>, <m>, <h>, and <d> (Seconds, Minutes, Hours, and Days).\n\n" +

                "**Example command:** `poll create yn 5m`");

                message.reply({embed:pollHelp});
            break;
        case "cancel":
            break;
        default:
            if(message.mentions.channels.first() != null)
            {
                var newPollChannel = message.mentions.channels.first();
                await addPollsChannel(client, message, newPollChannel);
            }
            else
                return returnMessage(client, message, `${failed_emote} please specify a poll option (e.g. create, end, help).`);
    }
}

async function createPoll(client, message, args, pollChannel)
{
    //Let's test to make sure the polls channel exists
    try {
        pollChannelCheck = await client.channels.get(pollChannel);
        if(pollChannelCheck == undefined || pollChannelCheck == null) throw new Error("Undefined channel provided");
    } catch(e) {
        await getPollChannel(client, message, true);
        return returnMessage(client, message, `${failed_emote} your polls channel doesn't seem to exist anymore. Please specify a new polls channel.`);
    }

    //The type of poll that's needed to create
    var type = args[1];
    var delay = 120000; //time in milliseconds
    switch(type)
    {
        case "yn":
            await message.reply("What would you like your poll message to display?");
            var collector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: delay, errors:['time']});

            collector.once('collect', info =>
            {
                //Ends the current process
                let collArgs = info.content.slice(0).trim().split(' ');
                if(collArgs[1] != "cancel")
                {
                    var em = new Discord.RichEmbed()
                        .setColor("#2489be")
                        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
                        .setTitle("Poll - Yes | No")
                        .setDescription(info.content)
                        .setFooter("Time remaining: 00:00:00");
                    client.channels.get(pollChannel).send({embed:em}).then(async msg =>
                    {
                        await msg.react(client.emojis.get("567699131733245992"));
                        await msg.react(client.emojis.get("559030535540834324"));

                        message_man.add(client, msg, "yn", args[2], message);
                    }).catch(err => { returnMessage(client, message, `${failed_emote} uh-oh! Looks like I don't have permission to talk in <#${pollChannel}>.`); });
                }
                else
                    message.channel.send(`${worked_emote} ${message.author}, poll creation has successfully been cancelled.`);
            });
            collector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} A poll creation has timed out due to inactivity.`); });
            break;
        case "mc":
            await message.reply("How many choices would you like to create (2 - 9)?");
            var mcCollector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: delay, errors:['time']});

            mcCollector.once('collect', async info =>
            {
                //Ends the current process
                let collArgs = info.content.slice(0).trim().split(' ');
                if(collArgs[1] != "cancel")
                {
                    var amount = info.content * 1;
                    if(isNaN(amount) || amount > 9 || amount < 2)
                        createPoll(client, message, args, pollChannel);
                    else
                        var hhh = await multipleChoicePoll(client, message, args, amount, pollChannel, []);
                }
                else
                    message.channel.send(`${worked_emote} ${message.author}, poll creation has successfully been cancelled.`);
            });

            mcCollector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} A poll creation has timed out due to inactivity.`); });
            break;
        case "ip":
            await message.reply("What would you like the description of your interest poll to say?");
            var mcCollector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: delay, errors:['time']});

            mcCollector.once('collect', async info =>
            {
                //Ends the current process
                let collArgs = info.content.slice(0).trim().split(' ');
                if(collArgs[1] != 'cancel')
                {
                    var em = new Discord.RichEmbed()
                        .setColor("#2489be")
                        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
                        .setTitle("Poll - Interest")
                        .setDescription(info.content)
                        .setFooter("Time remaining: 00:00:00");
                    client.channels.get(pollChannel).send({embed:em}).then(async msg =>
                    {
                        await msg.react(client.emojis.get("567699131733245992"));

                        message_man.add(client, msg, "ip", args[2], message);
                    }).catch(err => { returnMessage(client, message, `${failed_emote} uh-oh! Looks like I don't have permission to talk in <#${pollChannel}>.`); });
                }
                else
                    message.channel.send(`${worked_emote} ${message.author}, poll creation has successfully been cancelled.`);
            });

            mcCollector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} A poll creation has timed out due to inactivity.`); });
            break;
    }
}

function multipleChoicePoll(client, message, args, amount, pollChannel, arr)
{
    //Let's have the first entry be the poll title, and let's handle that later
    if(arr.length <= 0)
    {
        var choices = arr;

        message.reply(`what would you like your **Poll Title** to display?`);
        var mcCollector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: 120000, errors:['time']});

        mcCollector.once('collect', async info =>
        {
            //Ends the current process
            let collArgs = info.content.slice(0).trim().split(' ');
            if(collArgs[1] != 'cancel')
            {
                choices.push(info.content);
                multipleChoicePoll(client, message, args, amount, pollChannel, choices);
            }
            else
                message.channel.send(`${worked_emote} ${message.author}, poll creation has successfully been cancelled.`);
        });
        mcCollector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} A poll creation has timed out due to inactivity.`); });
    }

    //Once we've reached our goal
    if(arr.length-1 >= amount)
    {
        var outputDesc = "";
        for(var i = 1; i < arr.length; i++)
            outputDesc = `${outputDesc} ${numEmotes[i - 1]} ${arr[i]}\n`;

        var em = new Discord.RichEmbed()
            .setColor("#2489be")
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
            .setTitle("Poll - Multiple Choice")
            .setDescription(`**${arr[0]}**\n\n${outputDesc}`)
            .setFooter("Time remaining: 00:00:00");
        client.channels.get(pollChannel).send({embed:em}).then(async msg =>
        {
            for(var e = 0; e < arr.length - 1; e++)
                await msg.react(client.emojis.get(numEmotesID[e]));

            await message_man.add(client, msg, "mc", args[2], message);
        }).catch(err => { client.emit("error", err); returnMessage(client, message, `${failed_emote} uh-oh! Looks like I don't have permission to talk in <#${pollChannel}>.`); });
        console.log("DONE");
        return;
    }

    if(arr.length > 0)
    {
        //Let's grab what the user would like their option(s) to be
        var choices = arr;

        message.reply(`what would you like **Option ${arr.length}** to say?`);
        var mcCollector = new Discord.MessageCollector(message.channel, m => m.author.id == message.author.id, { max: 1, time: 120000, errors:['time']});

        mcCollector.once('collect', async info =>
        {
            //Ends the current process
            let collArgs = info.content.slice(0).trim().split(' ');
            if(collArgs[1] != 'cancel')
            {
                choices.push(info.content);
                multipleChoicePoll(client, message, args, amount, pollChannel, choices);
            }
            else
                message.channel.send(`${worked_emote} ${message.author}, poll creation has successfully been cancelled.`);
        });
        mcCollector.once('end', (c, r) => { if(r == "time") return returnMessage(client, message, `${failed_emote} A poll creation has timed out due to inactivity.`); });
    }
}

async function getPollChannel(client, message, reset)
{
    var pollData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);
    if(!reset)
    {
        var returnData = undefined;
        if(pollData.polls_channel == null)
            returnData = false;
        else
            returnData = pollData.polls_channel;

        return returnData;
    }
    else
    {
            pollData.polls_channel = null;
            await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, pollData);
            return;
    }
}

async function addPollsChannel(client, message, newPollsChannel)
{
    //Saving Guild data
    var pollSettings = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, "data", "id", message.guild.id);

    pollSettings.polls_channel = newPollsChannel.id;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/channel_settings.sqlite`, config.setChannelSettings, pollSettings);

    returnMessage(client, message, `${worked_emote} ${newPollsChannel} has successfully been set as your default polls channel!`);
}


function returnMessage(client, message, msg)
{
    var returnMsg = new Discord.RichEmbed()
        .setColor("be243e")
        .setDescription(msg);

    return message.reply({embed:returnMsg});
}
