//**DON'T FORGET TO REMOVE CRATES AFTER DONE TESTING**//
const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

const mojis = ['572583074072887306', '572583074441854976', '579508950118957063'];
const resourcesDir = './resources/prof_bg';
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    let crate_count = [];
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    crate_count[0] = memberInfo.crates;
    crate_count[1] = memberInfo.crates2;
    crate_count[2] = memberInfo.crates3;

    //If their total crate count is 0
    if(crate_count[0] + crate_count[1] + crate_count[2] <= 0) return message.reply("you don't have any crates to open!");
    //----

    //Inventory message
    const openMsg = new Discord.RichEmbed()
        .setColor('#8924be')
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setThumbnail(message.author.displayAvatarURL)
        .setTitle("<:gamemode_emote:560265411589963796> My Crate Inventory")
        .setDescription(`You are currently viewing your crate inventory. To open a crate, use their corresponding emotes.\n\n` +
                        `<:num1:572583074072887306> **Tier-I** Crates: **\`${crate_count[0]}\`** \n` +
                        `<:num2:572583074441854976> **Tier-II** Crates: **\`${crate_count[1]}\`** \n` +
                        `<:num3:579508950118957063> **Tier-III** Crates: **\`${crate_count[2]}\`**`);

    //Add emojis, and make sure to only add emotes for crates the user has
    let inventMsg = await message.reply({embed:openMsg});
    for(let i = 0;i < 3; i++)
        if(crate_count[i] > 0)
            await inventMsg.react(await client.emojis.get(mojis[i]));


    startCrateReactions(client, message, inventMsg, crate_count);
}

exports.crate1 = function (client, message, crate_count) { openCrate1(client, message, crate_count); }
exports.crate2 = function (client, message, crate_count) { openCrate2(client, message, crate_count); }
exports.crate3 = function (client, message, crate_count) { openCrate3(client, message, crate_count); }

async function startCrateReactions(client, message, inventMsg, crate_count)
{
    debugger;
    let emote1 = await client.emojis.get(mojis[0]);
    let emote2 = await client.emojis.get(mojis[1]);
    let emote3 = await client.emojis.get(mojis[2]);

    //Grab reactions from the inital message
    const reactions = await inventMsg.awaitReactions((reaction, user) => ((reaction.emoji.name == emote1.name) && (user.id == message.author.id)) || ((reaction.emoji.name == emote2.name) && (user.id == message.author.id)) || ((reaction.emoji.name == emote3.name) && (user.id == message.author.id)), {time: 15000, max: 1});

    //Grab the reactions, and make sure it's from the author
    if(crate_count[0] > 0) var emote1_reactions = await inventMsg.reactions.get(`${emote1.name}:${emote1.id}`).fetchUsers();
    if(crate_count[1] > 0) var emote2_reactions = await inventMsg.reactions.get(`${emote2.name}:${emote2.id}`).fetchUsers();
    if(crate_count[2] > 0) var emote3_reactions = await inventMsg.reactions.get(`${emote3.name}:${emote3.id}`).fetchUsers();
    inventMsg.delete();

    //Check to make sure their requested crate is available
    let found = false;
    if(crate_count[0] > 0 && !found)
        for(let i = 0; i < emote1_reactions.array().length; i++)
            if(emote1_reactions.array()[i].id == message.author.id)
            {
                found = true;
                openCrate1(client, message, crate_count[0]);
                break;
            }

    if(crate_count[1] > 0 && !found)
        for(let i = 0; i < emote2_reactions.array().length; i++)
            if(emote2_reactions.array()[i].id == message.author.id)
            {
                found = true;
                openCrate2(client, message, crate_count[1]);
                break;
            }

    if(crate_count[2] > 0 && !found)
        for(let i = 0; i < emote3_reactions.array().length; i++)
            if(emote3_reactions.array()[i].id == message.author.id)
            {
                found = true;
                openCrate3(client, message, crate_count[2]);
                break;
            }
}

async function openCrate1(client, message, crate_count)
{
    //Null means "nothing", they're rewarded with nothing
    const contents = ["T1Credits", "T2Credits", "T3Credits", "bg4", "bg20", null];
    const chance = [.7, .12, .01, .04, .04, .09];

    let item = randomPick(contents, chance);
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    switch(item)
    {
        case "T1Credits":
            var giveBal = Math.floor(Math.random() * 500) + 1;

            memberInfo.bal += giveBal;
            memberInfo.balTotal += giveBal;
            message.reply("has opened a **TIER I CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T2Credits":
            var giveBal = Math.floor(Math.random() * 2000) + 501;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER I CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T3Credits":
            var giveBal = Math.floor(Math.random() * 4000) + 1001;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER I CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "bg4":
            var profileAward = await awardBackground(client, message, "bg4");
            if(profileAward)
                message.reply("has opened a **TIER I CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg3.png`] });
            else
            {
                memberInfo.bal += 599;
    			memberInfo.balTotal += 599;
                message.reply("has opened a **TIER I CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg20":
            var profileAward = await awardBackground(client, message, "bg20");
            if(profileAward)
                message.reply("has opened a **TIER I CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg19.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER I CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case null:
            message.reply("has opened a **TIER I CRATE**, and has unfortunately recieved **Nothing!**");
            break;
    }

    memberInfo.crates--;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
}

async function openCrate2(client, message, crate_count)
{
    //Null means "nothing", they're rewarded with nothing
    const contents = ["T1Credits", "T2Credits", "T3Credits", "bg4", "bg5", "bg10", "bg11", "bg14", "bg15", null];
    const chance = [.55, .15, .025, .075, .03, .03, .03, .03, .03, .05];

    let item = randomPick(contents, chance);
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    switch(item)
    {
        case "T1Credits":
            var giveBal = Math.floor(Math.random() * 500) + 251;

            memberInfo.bal += giveBal;
            memberInfo.balTotal += giveBal;
            message.reply("has opened a **TIER II CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T2Credits":
            var giveBal = Math.floor(Math.random() * 2000) + 751;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER II CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T3Credits":
            var giveBal = Math.floor(Math.random() * 4000) + 1001;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER II CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "bg4":
            var profileAward = await awardBackground(client, message, "bg4");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg3.png`] });
            else
            {
                memberInfo.bal += 599;
    			memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg5":
            var profileAward = await awardBackground(client, message, "bg5");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg4.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg10":
            var profileAward = await awardBackground(client, message, "bg10");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg9.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg11":
            var profileAward = await awardBackground(client, message, "bg11");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg10.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg14":
            var profileAward = await awardBackground(client, message, "bg14");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg13.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg15":
            var profileAward = await awardBackground(client, message, "bg20");
            if(profileAward)
                message.reply("has opened a **TIER II CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg14.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER II CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case null:
            message.reply("has opened a **TIER II CRATE**, and has unfortunately recieved **Nothing!**");
            break;
    }

    memberInfo.crates2--;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
}

//Rewarding crate tier 3 openings
async function openCrate3(client, message, crate_count)
{
    //Null means "nothing", they're rewarded with nothing
    const contents = ["T1Credits", "T2Credits", "T3Credits", "bg2", "bg3", "bg4", "bg5", "bg8", "bg18", "bg26", null];
    const chance = [.5, .15, .07, .07, .05, .03, .03, .03, .02, .02, .03];

    let item = randomPick(contents, chance);
    let memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
    switch(item)
    {
        case "T1Credits":
            var giveBal = Math.floor(Math.random() * 500) + 251;

            memberInfo.bal += giveBal;
            memberInfo.balTotal += giveBal;
            message.reply("has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T2Credits":
            var giveBal = Math.floor(Math.random() * 2000) + 751;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "T3Credits":
            var giveBal = Math.floor(Math.random() * 4000) + 1001;

            memberInfo.bal += giveBal;
			memberInfo.balTotal += giveBal;
			message.reply("has opened a **TIER III CRATE**, and has been awarded **" + giveBal + " Quarters!**");
            break;
        case "bg2":
            var profileAward = await awardBackground(client, message, "bg4");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg1.png`] });
            else
            {
                memberInfo.bal += 599;
    			memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg3":
            var profileAward = await awardBackground(client, message, "bg5");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg2.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg4":
            var profileAward = await awardBackground(client, message, "bg10");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg3.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg5":
            var profileAward = await awardBackground(client, message, "bg11");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg4.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg8":
            var profileAward = await awardBackground(client, message, "bg14");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg7.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg18":
            var profileAward = await awardBackground(client, message, "bg20");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg17.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case "bg26":
            var profileAward = await awardBackground(client, message, "bg20");
            if(profileAward)
                message.reply("has opened a **TIER III CRATE**, and has been awarded a **Profile Background!**", { files: [`${resourcesDir}/bg25.png`] });
            else
            {
                memberInfo.bal += 599;
                memberInfo.balTotal += 599;
                message.reply("has opened a **TIER III CRATE**, and has been awarded **599 Quarters!**");
            }
            break;
        case null:
            message.reply("has opened a **TIER III CRATE**, and has unfortunately recieved **Nothing!**");
            break;
    }

    memberInfo.crates3--;
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
}

async function awardBackground(client, message, bg)
{
    let memberBgCrateInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);

    //If the use already has that background, return false. If not, continue to unlock that background
    let objectKeys = Object.keys(memberBgCrateInfo);
    let objectValues = Object.values(memberBgCrateInfo);
    for(var i = 0; i < objectKeys.length; i++)
        if(objectKeys[i] == bg)
        {
            if(objectValues[i] == 1)
                return false;

            objectValues[i] = 1;
        }

    let merged = await sqlHand.merge(objectKeys, objectValues);
    await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, merged);

    return true;
}

function randomPick(contents, chance)
{
    let weightedContents = [];
    for(let i = 0; i < chance.length; i++)
        for(let k = 0; k < chance[i] * 100; k++)
            weightedContents.push(contents[i]);

    let num = Math.floor(Math.random() * weightedContents.length);
    return weightedContents[num];
}
