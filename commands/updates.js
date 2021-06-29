const Discord = require("discord.js");
const storage = require("node-persist");
const fs = require("fs");

var VALID_DISCRIMINATOR = '4461';
var UPDATES_IDENTIFIER = "0ab/updates_history";
if(typeof hasSetup === 'undefined') var hasSetup = false;

config = undefined;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    config = confi;
    if(!hasSetup)
        await setup();

    if(args[0] == "push" && message.author.discriminator == VALID_DISCRIMINATOR)
        return await push_update(client, message, args);

    if(args[0] == "pull" && message.author.discriminator == VALID_DISCRIMINATOR)
        return await pull_update(client, message, args);
    
    fetchUpdates(client, message);
}

async function fetchUpdates(client, message)
{
    message.reply("please check your DM's.");
    var updateEmbed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username}#${client.user.discriminator}`, client.user.displayAvatarURL)
        .setColor("#FFFFFF")
        .setTitle("Update History");

    var desc = "";
    var updateInfo = await storage.getItem(UPDATES_IDENTIFIER);
    for(var i = 0; i < updateInfo.length; i++)
    {
        if(desc.length >= 1500)
        {
            updateEmbed.setDescription(desc);
            await message.author.send({embed:updateEmbed});
            desc = "";
        }
        var currUpdate = JSON.parse(updateInfo[i]);
        desc += `**${i + 1}.) Date:** ${currUpdate.date}\n**Info:** ${currUpdate.description}\n\n`;
    }

    updateEmbed.setDescription(desc);
    await message.author.send({embed:updateEmbed});
}

async function pull_update(client, message, args)
{
    //If the next arg isn't a number, stop and send a message
    if(isNaN(args[1])) return message.reply("please provide a valid update number.");

    //Get the updates list, and heck to make sure te requested number is within the array
    var updates = await storage.getItem(UPDATES_IDENTIFIER);
    if(args[1] < 1 || args[1] > updates.length) return message.reply("please provide a valid number within the updates list.");

    var index = args[1] * 1;
    var pulled_info = JSON.parse(updates.splice(index - 1, 1));
    await storage.setItem(UPDATES_IDENTIFIER, updates);

    message.reply("Update successfully removed:\n```" + `Date: ${pulled_info.date}\nInfo: ${pulled_info.description}` + "```");
}

async function push_update(client, message, args)
{
    var update_info = "";
    for(var i = 1; i < args.length; i++)
        update_info += `${args[i]} `;

    //Grab the current date, and save it (Month / Day / Year)
    var date = new Date().toString().trim().split(" ");
    var dateArgs = `${date[1]} ${date[2]} ${date[3]}`;

    var saveObject = JSON.stringify(
    {
        date: dateArgs,
        description: update_info
    });

    var currUpdates = await storage.getItem(UPDATES_IDENTIFIER);
    currUpdates.unshift(saveObject);
    await storage.setItem(UPDATES_IDENTIFIER, currUpdates);

    return message.reply("Update succesfully added!");
}

async function setup()
{
    await storage.init(
    {
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: "utf8",
        ttl: false
    });

    var temp = await storage.getItem(UPDATES_IDENTIFIER);
    if(typeof temp === 'undefined')
        await storage.setItem(UPDATES_IDENTIFIER, []);

    hasSetup = true;
}