const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

/*
Creating the shop marketplace
= STRUCTURE =
// (index, cost)

== LEGEND ==
0: T1 - Crate (3,000)
1: T2 - Crate (3,700)
2: T3 - Crate (5,200)
3: Instant-Level (5 quarters : 1 xp)
4: Random BG (20,000)
5: Millionaie Role (1m)
*/

//The amount of credits "quarters" it takes to buy 1 exp.
const TRANSFER_CREDITS_PER_EXP = 5;

var marketPlace = new Map();

marketPlace.set('0', 2000);
marketPlace.set('1', 3000);
marketPlace.set('2', 4000);
marketPlace.set('3', 0); //This will get changed depending on the user who requested this command
marketPlace.set('4', 20000);
marketPlace.set('5', 1000000);

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    var id = args[1];
    var amount = args[2] * 1;
    if(args[2] == null || args[2] == undefined)
        amount = 1;

    var totalCost = (marketPlace.get(id)) * amount;
    var initalCost = marketPlace.get(id);
    var userBal = await getUserData(client, message, "bal", "USER_DATA");
    if(userBal < totalCost) return message.channel.send(`${message.author}, You do not have enough Quarters.`);

    switch(id)
    {//function setUserData(client, message, type, sql, amount, bg)
        case '0':
            await setUserData(client, message, "crates", "USER_DATA", amount, null);
            await setUserData(client, message, "bal", "USER_DATA", totalCost, null);
            message.reply(`you've successfully purchased **${amount} Tier-I Crates**!`);
            break;

        case '1':
            await setUserData(client, message, "crates2", "USER_DATA", amount, null);
            await setUserData(client, message, "bal", "USER_DATA", totalCost, null);
            message.reply(`you've successfully purchased **${amount} Tier-II Crates**!`);
            break;

        case '2':
            await setUserData(client, message, "crates3", "USER_DATA", amount, null);
            await setUserData(client, message, "bal", "USER_DATA", totalCost, null);
            message.reply(`you've successfully purchased **${amount} Tier-III Crates**!`);
            break;

        case '3':
            //message.channel.send("Not yet supported.");
            var userBal = await getUserData(client, message, "bal", "USER_DATA");
            var userXP = await getUserData(client, message, "exp", "USER_DATA");
            var userLevel = await getUserData(client, message, "level", "USER_DATA");
            var currLevelXPNeeded = 5 * (userLevel * userLevel) - 5 * userLevel + config.initial_exp;
            var remainingXP = currLevelXPNeeded - userXP;

            var requiredBal = TRANSFER_CREDITS_PER_EXP * remainingXP;
            if(userBal < requiredBal) return message.channel.send(`${message.author}, You do not have enough Quarters.`);

            await setUserData(client, message, "bal", "USER_DATA", requiredBal - 50, null);
            await setUserData(client, message, "expM", "USER_DATA", userXP, null);
            await setUserData(client, message, "level", "USER_DATA", 1, null);
            await setUserData(client, message, "crates", "USER_DATA", 1, null);
            userLeveledUpNotif(message, userLevel++, 50, false, false);
            message.channel.send(message.author + ", you've successfully purchased a level!");
            break;

        case '4':
            var availableBGs = await getUserData(client, message, null, "USER_PROFILE");
            if(availableBGs.length <= 0) return message.channel.send("You already have all of the backgrounds unlocked!");
            var rewardedBG = availableBGs[Math.floor(Math.random() * availableBGs.length)];

            await setUserData(client, message, null, "USER_PROFILE", null, rewardedBG);
            await setUserData(client, message, "bal", "USER_DATA", totalCost, null);
            message.channel.send(message.author + ", you've unlocked a new background!", { files: [`./resources/prof_bg/bg${rewardedBG - 1}.png`] });
            break;

        case '5':
            var role = await message.guild.roles.find('name', 'Millionaire');
            var guildUser = await message.guild.members.find('id', message.author.id);
            if(role == undefined)
            {
                try { role = await message.guild.createRole({name: "Millionaire", color: "#ffcb00"}); }
                catch(e) { return message.reply("something is wrong! I don't have proper permissions to create a new role."); }
            }

            if(guildUser.roles.has(role.id)) return message.reply("you already have this role!");

            try { await guildUser.addRole(role); }
            catch(e) { message.reply("something went wrong! I don't have proper permissions to manage your roles."); }
            await setUserData(client, message, "bal", "USER_DATA", initalCost, null);
            message.reply("you've been awarded the **Millionaire Role**!");
            break;

        default:
            var userLevel = await getUserData(client, message, "level", "USER_DATA");
            var userXP = await getUserData(client, message, "exp", "USER_DATA");
            var currLevelXPNeeded = 5 * (userLevel * userLevel) - 5 * userLevel + config.initial_exp;
            var remainingXP = currLevelXPNeeded - userXP;
            var requiredBal = (TRANSFER_CREDITS_PER_EXP * remainingXP).toLocaleString();

            var spaces = "            ";
            for(_ss = 0; _ss < requiredBal.length; _ss++)
                spaces[0] = "";

            message.channel.send("```scala\n" +
            "ID              ITEM               COST\n" +
            "========================================\n" +
            "0          Tier-I Crate           2,000\n" +
            "1          Tier-II Crate          3,000\n" +
            "2          Tier-III Crate         4,000\n" +
            `3          Instant level up      ${requiredBal}\n` +
            "4          Random Background     20,000\n\n" +

            "5          Millionaire Role   1,000,000\n" +
            "========================================\n" +
            "Use: shop buy <id> <amount>\n```");
            break;
    }
}
/*

message.channel.send("```scala\n" +
            "ID       ITEM                 COST\n" +
            "==================================\n" +
            "[0]  Tier-I Crate           3,000\n" +
            "[1]  Tier-II Crate          6,500\n" +
            "[2]  Tier-III Crate         9,000\n" +
            `[3]  Instant level up      ${requiredBal}\n` +
            "[4]  Random Background     25,000\n" +
            "==================================\n" +
            "Use +shop buy <id> <amount>\n```");

*/

function userLeveledUpNotif(message, level, gold, multi, t2)
{
	if(multi)
		gold += gold;

	const lvl = new Discord.RichEmbed()
		.setColor("#be243e")
		.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
		.setThumbnail(message.author.displayAvatarURL);

	if(t2)
		lvl.addField(`**LEVEL UP!**`, `${message.author} is now **level ${level}!**\nYou have gained **${gold} Quarters** & **a TIER II Crate Drop** within the, **${message.guild.name}** server!`);
	else
		lvl.addField(`**LEVEL UP!**`, `${message.author} is now **level ${level}!**\nYou have gained **${gold} Quarters** & **a Crate Drop** within the, **${message.guild.name}** server!`);

	message.author.send({embed:lvl});

}

async function getUserData(client, message, type, sql)
{
    if(sql == "USER_DATA")
    {
        var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

        var returnValue = null;
        switch(type)
        {
            case "bal":
                returnValue = memberInfo.bal;
                break;
            case "exp":
                returnValue = memberInfo.exp;
                break;
            case "level":
                returnValue = memberInfo.level;
                break;
        }
    }
    else if(sql == "USER_PROFILE")
    {
        var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);
        var returnValue = [];

        var memberObjectKeys = Object.keys(memberBgInfo);
        var memberObjectValues = Object.values(memberBgInfo);
        for(var i = 4; i < memberObjectKeys.length; i++)
        {
            if(memberObjectKeys[i] == 'bg23') continue;

            if(memberObjectValues[i] != 1)
                returnValue[returnValue.length] = i - 2;
        }
    }

    return returnValue;
}

async function setUserData(client, message, type, sql, amount, bg)
{
    if(sql == "USER_DATA")
    {
        var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

        var returnValue = null;
        switch(type)
        {
            case "bal":
                memberInfo.bal -= amount;
                break;
            case "expG":
                memberInfo.exp += amount;
                break;
            case "expM":
                memberInfo.exp -= amount;
                break;
            case "level":
                memberInfo.level += amount;
                break;
            case "crates":
                memberInfo.crates += amount;
                break;
            case "crates2":
                memberInfo.crates2 += amount;
                break;
            case "crates3":
                memberInfo.crates3 += amount;
                break;
        }

        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
    }
    else if(sql == "USER_PROFILE")
    {
        var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);
        var memberObject = Object.keys(memberBgInfo);
        var memberObjectValues = Object.values(memberBgInfo);

        for(let i = 0; i < memberObject.length; i++)
            if(`bg${bg}` == memberObject[i])
            {
                memberObjectValues[i] = 1;
                break;
            }

        let merged = await sqlHand.merge(memberObject, memberObjectValues);
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, merged);
    }

    return returnValue;
}
