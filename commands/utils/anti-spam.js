const Discord = require('discord.js');
const action_man = require("./action_manager.js");

const roleName = "TOGMuted";
let warnedUsers = [];
let messageLog = [];
let mutedUsers = new Map();

const warningMessage = "please watch the spam. Continued spamming could results in a ban.";
const muteMessage = "has been muted for **30 minutes** for spamming."
const banMessage = "has been hit with the **BAN HAMMER** for spamming!";

exports.roleName = roleName;
module.exports = async(client, options) =>
{
    const warnLimit = (options && options.warnLimit) || 4; //Warn limit (For spam, and dupe messages)
    const actionLimit = (options && options.actionLimit) || 6; //Action limit (For spam, and dupe messages)
    const muteLength = (options && options.muteLength) || 1500000; //Mute duration (time in milliseconds) [default: 25 minutes]
    const timeScan = (options && options.timeScan) || 2000; //Time scan. How much time should be given between messages before someone is considered spamming
    const deleteMessagesAfterDays = (options && options.deleteMessagesAfterDays) || 7; //Delete messages after x-days (only occurs when banned)

    client.on("spamMessageCheck", async message =>
    {
        if(message.author.bot) return;
        if(message.channel.type == "dm") return;
        if(!mutedUsers.get(message.guild.id)) mutedUsers.set(message.guild.id, []);

        //Memory test
        // * Ideas:
        // ** Clear the array after # messages (don't go past 1,000,000 maybe)
        // ** Remove messages from the array after x:xx amount of time
        // if(messageLog.length < 1)
        // {
        //     for(let i = 0; i < 1000000; i++)
        //         await addMessageLog(message);
        // }

        //Check if they're spamming in quick succession
        let num = 1; //Starts at 1 to include their current message
        let currTime = Date.now();


        for(let i = messageLog.length - 1; i >= 0; i--)
        {
            if(messageLog[i].author != message.author.id) continue;
            if((currTime) - messageLog[i].time <= timeScan) num++;
        }

        console.log(messageLog.length);
        //console.log(messageLog);

        //Checks to see if they've been warned already
        let found = false;
        if(num >= warnLimit)
        {
            for(let i = 0; i < warnedUsers.length; i++)
                if(warnedUsers[i].author == message.author.id)
                {
                    found = true;
                    break;
                }

            if(!found)
            {
                await addWarnedUsers(message);

                //Clear the users messages from the log to prevent instant muting
                for(let i = messageLog.length - 1; i >= 0; i--)
                {
                    if(messageLog[i].author == message.author.id && messageLog[i].guild == message.guild.id)
                        messageLog.splice(i, 1);
                }
            }
            else
                await muteUser(client, message);
        }

        addMessageLog(message);
    });
}

exports.unmuted = async(guildID, userID) =>
{
    let mutedArr = await mutedUsers.get(guildID);
    for(let i = 0; i < mutedArr.length; i++)
        if(mutedArr[i] == userID)
        {
            mutedArr.splice(i);
            break;
        }

    mutedUsers.set(guildID, mutedArr);
}

async function muteUser(client, message)
{
    //Check to make sure we have our muted role
    await createMutedRole(message);

    let mutedArr = mutedUsers.get(message.guild.id);
    for(let i = 0; i < mutedArr.length; i++)
        if(mutedArr[i] == message.author.id) return;

    mutedArr.push(message.author.id);
    await mutedUsers.set(message.guild.id, mutedArr);

    let mutedRole = message.guild.roles.find(role => role.name == roleName);
    let guildUser = message.guild.members.find(user => user.id == message.author.id);

    if(await !guildUser.roles.find(role => role.id == mutedRole.id))
    {
        await guildUser.addRole(mutedRole);
        message.reply("has been muted for spamming.");
        action_man.add(client, message, "mute", 15, message.author); //muteLength / 1000
    }
}

async function createMutedRole(message, pos)
{
    if(message.guild.roles.find(role => role.name === 'TOGMuted')) return; //If the role already exists
    if(!pos) return createMutedRole(message, await message.guild.roles.size);

    data = {
        name: roleName,
        color: "LIGHT_GREY",
        position: pos - 1,
        mentionable: false,
        permission: ["MOVE_MEMBERS"]
    }

    //Error catch
    let role = undefined;
    try
    {
        let role = await message.guild.createRole(data, "Unable to find a muted role, creating a new one.");
        let channelsArr = message.guild.channels.array();
        for(let i = 0; i < channelsArr.length; i++)
        {
            channelsArr[i].overwritePermissions(role,
                {
                    'SEND_MESSAGES': false,
                    'SEND_TTS_MESSAGES': false,
                    'CONNECT': false,
                    'CHANGE_NICKNAME': false

                }, "Adding the muted role permissions to all channels.");
        }

        return;
    }
    catch(e)
    {
        try
        {
            await message.guild.roles.find(role => role.name === roleName).delete();
            createMutedRole(message, pos - 1);
        } catch(err) { return message.channel.send("Uh-oh, it looks like I'm not able to moderate properly. Please ensure I have access to admin permissions to continue moderating."); }
    }
}

async function addWarnedUsers(message)
{
    data = {
        author: message.author.id,
        guild: message.guild.id
    }

    message.reply(warningMessage);
    warnedUsers.push(data);
}

async function addMessageLog(message)
{
    data = {
        author: message.author.id,
        guild: message.guild.id,
        message: message.content,
        time: message.createdTimestamp
    }
    messageLog.push(data);
}
