const Discord = require("discord.js");
const canvas = require('canvas');
const sqlHand = require("./utils/sql_handler.js");
const config = require("../config.json");
const randText = require("./utils/random_text.json");

const REWARD = 10;
const text_width = 500;
const text_height = 125;

if(typeof is_game_active === 'undefined') is_game_active = new Map();
if(typeof game_active_time === 'undefined') game_active_time = new Map();
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    if(args[0] == 'start')
    {
        //If there's already a game in progress within the same channel (change it to per user?)
        if(is_game_active.get(message.channel.id)) return message.reply("<:warning_emote:559030535540834324> there's already a **Type Racer** game active in this channel!");

        //Mark the channel as "in-progress"
        is_game_active.set(message.channel.id, true);

        //---
        let num = Math.floor(Math.random() * randText.length);
        let myCanvas = canvas.createCanvas(text_width, text_height); //width, height
        let cptx = myCanvas.getContext('2d');

        cptx.font = '20px Biko';
    	cptx.textAlign = 'center';
        cptx.fillStyle = '#ffffff';
    	cptx.fillText(randText[num], Math.floor(myCanvas.width / 2), Math.floor(myCanvas.height / 2), myCanvas.width - 20);

        let image = new Discord.Attachment(myCanvas.toBuffer(), 'typeracer.png');

        //Start the gamemode
        main(client, message, image, num);
    }
    else
    {
        let raceHelp = new Discord.RichEmbed()
            .setColor("#2489be")
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
            .setTitle("Racing Racer")
            .setDescription("Welcome to Type Racer. The objective of this game is simple. When the game starts, random text will be provided by me! The first person to type the given sentence will be rewarded. \n\nTo start the game, use the command `" + guildPrefix + "typerace start`")
            .addField("Command Help:", "** **");

        message.reply({embed:raceHelp});
    }
}

async function main(client, message, image, num)
{
    let timeoutTime = Math.floor(randText[num].length / 2.5);

    let raceMsg = await message.channel.send(`**You have ${timeoutTime}s to finish this race.**`, {file:image});
    let time = Math.round(new Date().getTime() / 1000); //Time in seconds
    game_active_time.set(message.channel.id, time);

    let collector = new Discord.MessageCollector(message.channel, m => m.content == randText[num], { max: 1, time: timeoutTime * 1000, errors:['time']});
    collector.once('collect', async info =>
    {
        raceMsg.delete().catch(err => {});

        //utils.give(client, REWARD, message.author.id);
        let time_diff = (Math.floor(new Date().getTime() / 1000) - (await game_active_time.get(message.channel.id))) - 1;
        info.reply(`has **Completed** the race in under **${time_diff}s** and gained **${REWARD} Quarters**!`);

        var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${info.guild.id}/members/member_data.sqlite`, "data", "id", info.author.id);
        memberInfo.bal += REWARD;
        await sqlHand.setData(client, `./SQL/guild_data/${info.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);

        var memberStats = await sqlHand.getData(client, `./SQL/guild_data/${info.guild.id}/games/users/gamesStats.sqlite`, "data", "id", info.author.id);
        memberStats.typeraceW++;
        await sqlHand.setData(client, `./SQL/guild_data/${info.guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, memberStats);

        game_active_time.delete(message.channel.id);
        is_game_active.delete(message.channel.id);
    });
    collector.once('end', (c, r) =>
    {
        if(r == "time")
        {
            is_game_active.delete(message.channel.id);
            game_active_time.delete(message.channel.id);
            return message.channel.send(`Nobody seemed to finish in time!`);
        }
    });
}
