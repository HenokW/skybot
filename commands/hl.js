//** Still needs adjusting. SQL changes still need to be made **//

const Discord = require("discord.js");
const config = require("../config.json");
const SQLite = require("better-sqlite3");
const sqlHand = require("./utils/sql_handler.js");

var debug = false;
var isDisabled = false;

var TIMEOUT_TIME = 300; //Time in seconds before a game is void (default 300 sec | 5 min)
var MAX_NUM = 150; //Guess a number from 1 > MAX_NUM
var START_PRICE = 20; //Cost to enter
var REWARD_FACTOR = Math.abs(Math.floor(START_PRICE / 3) - 2); //How much players are rewarded (Base it off of the start price)

if(typeof playerList === 'undefined') playerList = new Map();
if(typeof playerStreak === 'undefined') playerStreak = new Map();
if(typeof playerTimeout === 'undefined') playerTimeout = new Map();
if(typeof playerMessages === 'undefined') playerMessages = new Map();
if(typeof timeoutLoop === 'undefined') timeoutLoop = false;

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    message.channel.startTyping();
    if(isDisabled)
    {
        message.channel.stopTyping();
        return message.reply("High or Low is currently disabled.");
    }

    if((message.author.discriminator != "4461") && (debug)) return message.reply("High or Low is currently unavailable.");

    var dir = args[0];
    if(dir == "start")
    {
        var userBal = await getSQLdata(client, message, "bal");
        if(userBal < START_PRICE)
        {
            message.channel.stopTyping();
            return message.reply(`you do not have enough quarters to start **High or Low**, (quarters required: **${START_PRICE}**).`);
        }

        if(playerList.get(message.author.id))
        {
            message.channel.stopTyping();
            return message.reply("you already have an active game going.");
        }

        await setSQLData(client, message, "balMin", START_PRICE);

        var currTime = Math.round((new Date()).getTime() / 1000); //The current time in seconds
        var numGen = Math.floor(Math.random() * MAX_NUM) + 1;
        playerList.set(message.author.id, numGen); //The users current number
        playerStreak.set(message.author.id, 0); //A users correctness streak
        playerTimeout.set(message.author.id, currTime + TIMEOUT_TIME); //Timeout time to end an ignored game
        playerMessages.set(message.author.id, message); //Keeps track of their message object
        sendGameMessage(client, message);

        if(!timeoutLoop)
        {
            timeoutLoop = true;
            timeoutSystem(client);
        }
    }
    else if(dir == "high" || dir == "low")
    {
        if(!playerList.get(message.author.id))
        {
            message.channel.stopTyping();
            return message.reply("You don't seem to have an active game. Please use the **`hl`** command to view your options.");
        }

        var validityCheck = checkValidInfo(message, args);
        if(validityCheck != true)
        {
            message.channel.stopTyping();
            return validityCheck;
        }

        var currTime = Math.round((new Date()).getTime() / 1000); //The current time in seconds
        playerTimeout.set(message.author.id, currTime + TIMEOUT_TIME); //Timeout time to end an ignored game
        if(dir == "high")
            await nextGameCycle(client, message, "higher");
        else
            await nextGameCycle(client, message, "lower");
    }
    else if(dir == "top")
    {
        let members = message.guild.members.array();
        let membersStats = new Array(members.length);
        for(let i = 0; i < members.length; i++)//291-714-6424
        {
            membersStats[i] = new Array(2);

            var info = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, "data", "id", members[i].user.id);
            membersStats[i][0] = members[i].user.id;
            membersStats[i][1] = info.hlStreak;
        }

        await membersStats.sort((a, b) => { return b[1] - a[1]; });
        var hlTopEmbed = new Discord.RichEmbed()
    		.setColor("#be243e")
    		.setThumbnail(message.guild.iconURL)
    		.setTitle("High or Low Streaks Leaderboard")
    		.setFooter("Streaks leaderboard")
    		.setTimestamp()
    		.setAuthor(client.user.username + "#" + client.user.discriminator, client.user.displayAvatarURL);

        var limit = 10;
        if(membersStats.length < 10)
    		var limit = membersList.length;
        for(let i = 0; i < limit; i++)
            hlTopEmbed.addField(`${i + 1}.) Streak **${membersStats[i][1]}**`, `<@${membersStats[i][0]}>`, true);

        message.reply({embed:hlTopEmbed});
    }
    else
    {
        var hlHelp = new Discord.RichEmbed()
            .setColor("#2489be")
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
            .setTitle("High or Low")
            .setDescription("Welcome to High or Low. The objective of this game is to guess whether your next number will be higher, or lower than the random number given to you.\n\nTo start the game, use the command `" + guildPrefix + "hl start`")
            .addField("Command Help:",
            "To guess higher: `" + guildPrefix + "hl high`\n" +
            "To guess lower: `" + guildPrefix + "hl low`\n");

        message.reply({embed:hlHelp});
    }

    //function sendGameMessage(client, message);
    message.channel.stopTyping();
}

async function nextGameCycle(client, message, type)
{
    //Grab their new number, and add a check later
    var newNum = Math.floor(Math.random() * MAX_NUM) + 1;
    var currentNum = playerList.get(message.author.id);

    //Just to make sure the new number isn't equal to their current num
    while(newNum == currentNum) newNum = Math.floor(Math.random() * MAX_NUM) + 1;
    switch(type)
    {
        case "higher":
            if(newNum > currentNum)
            {
                playerList.set(message.author.id, newNum);
                correctUser(message); //Increase they're streak
                sendGameMessage(client, message, true); //Let them know they're right, and give them a new challenge
            }
            else
                incorrectUser(client, message, newNum);
            break;
        case "lower":
            if(newNum < currentNum)
            {
                playerList.set(message.author.id, newNum);
                correctUser(message); //Increase they're streak
                sendGameMessage(client, message, true); //Let them know they're right, and give them a new challenge
            }
            else
                incorrectUser(client, message, newNum);
            break;
    }
}

async function incorrectUser(client, message, newNum)
{
    let statsData = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, "data", "id", message.author.id);
    let streak = await playerStreak.get(message.author.id)

    if(streak > statsData.hlStreak)
    {
        statsData.hlStreak = streak;
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, statsData);
    }

    var points = ((playerStreak.get(message.author.id)) * REWARD_FACTOR) + playerStreak.get(message.author.id);
    var hlLost = new Discord.RichEmbed()
        .setColor("#be243e")
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle("High or Low")
        .setDescription(`Oh no! Unfortunately you're wrong. Your old number was: **${playerList.get(message.author.id)}** while your new number was: **${newNum}**`)
        .addField("Quarters rewarded:", `You've been rewarded **${points} Quarters!**`)
        .setFooter(`Your streak was: ${streak}`)
        .setTimestamp();

    playerList.delete(message.author.id);
    playerStreak.delete(message.author.id);
    playerTimeout.delete(message.author.id);
    playerMessages.delete(message.author.id);
    message.reply({embed:hlLost});

    if(points > 0)
        await setSQLData(client, message, "balGain", points);
}

function correctUser(message)
{
    var currentStreak = playerStreak.get(message.author.id);
    playerStreak.set(message.author.id, ++currentStreak);
}

function checkValidInfo(message, args)
{
    if(!playerList.get(message.author.id))
        return message.reply("you don't have an active game. To start please use the `hl start` command.");

    return true;
}

/*
- Figure out how to reward Points
- Reverse the reward to get how many wins the user has had
*/
function sendGameMessage(client, message, won)
{
    var hlMsg = new Discord.RichEmbed()
        .setColor("#2489be")//2489be 3abe24
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle("High or Low")
        .setDescription(`Your current number is: **${playerList.get(message.author.id)}**. Guess whether your next number will be higher or lower than your current one.\n\nNumbers range from: 1 - ${MAX_NUM}`)
        .addField("Command Help:",
            "Guessing higher: **`hl high`**\n" +
            "Guessing lower: **`hl low`**")
        .setFooter(`Current streak: ${playerStreak.get(message.author.id)}`)
        .setTimestamp();

    if(won)
    {
        hlMsg.setColor('3abe24')
        .setDescription(`Correct! Your current number is: **${playerList.get(message.author.id)}**. Guess whether your next number will be higher or lower than your current one.\n\nNumbers range from: 1 - ${MAX_NUM}`);
    }

    message.reply({embed:hlMsg});
}

async function getSQLdata(client, message, data)
{
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    switch(data)
    {
        case "bal":
            return memberInfo.bal;
    }


}

async function setSQLData(client, message, data, amount)
{
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    switch(data)
    {
        case "balMin":
            memberInfo.bal -= amount;
            break
        case "balGain":
            memberInfo.bal += amount;
            break;
    }

    await sqlHand.setData(client, `./SQL/guild_data/${guildID}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
}

//Method that handles inactive games
async function timeoutSystem(client)
{
    var key_array = await playerTimeout.keys();
    for(var i = 0; i < playerTimeout.size; i++)
    {
        var key_value = key_array.next().value;
        var requiredTime = playerTimeout.get(key_value);
        var currTime = Math.round((new Date()).getTime() / 1000); //The current time in seconds

        if(currTime >= requiredTime)
        {
            //Delete their available data
            playerTimeout.delete(key_value);
            playerStreak.delete(key_value);
            playerList.delete(key_value);

            //Notify the user that their game has ended
            var message_object = playerMessages.get(key_value);
            message_object.reply("your **High or Low** game session has ended due to inactivity.");
            playerMessages.delete(key_array);
        }
    }

    if(playerTimeout.size > 0)
        setTimeout(function() { timeoutSystem(client); }, 60000);
     else
         timeoutLoop = false; //Currently inactive
}
