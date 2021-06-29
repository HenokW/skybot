const Discord = require("discord.js");
const canvas = require('canvas');
const sqlHand = require("./utils/sql_handler.js");
const config = require("../config.json");

//Emotes
const num1 = '572583074072887306';
const num2 = '572583074441854976';
const num3 = '579508950118957063';
const num4 = '579508952090279960';

const numEmotes = ['num1:572583074072887306', 'num2:572583074441854976',
                'num3:579508950118957063', 'num4:579508952090279960'];
//----
const REWARD = 15;

const track_width = 840;
const track_height = 650;
const track_bg1 = './resources/games/race/background-1.png';
const track_bg2 = './resources/games/race/race_finish.png';
const car1 = './resources/games/race/car1.png';
const car2 = './resources/games/race/car2.png';
const car3 = './resources/games/race/car3.png';
const car4 = './resources/games/race/car4.png';

if(typeof game_session === 'undefined') game_session = new Map();
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    if(args[0] == 'start')
    {
        //If there's already a game in progress within the same channel (change it to per user?)
        if(game_session.get(message.channel.id)) return message.reply("<:warning_emote:559030535540834324> there's already a **Type Racer** game active in this channel!");

        //Mark the channel as "in-progress"
        game_session.set(message.channel.id, true);

        startRace(client, message);
    }
    else
    {
        let raceHelp = new Discord.RichEmbed()
            .setColor("#2489be")
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
            .setTitle("Random Racing")
            .setDescription("Welcome to Random Racing. The objective of this game is to bet on 1 of 4 different cars. Anyone who votes on the winning car will recieve a reward, but if you've voted for more than 1 car, your vote will not count, and you won't be rewarded! \n\nTo start the game, use the command `" + guildPrefix + "race start`")
            .addField("Command Help:", "** **");

        message.reply({embed:raceHelp});
    }
}

async function startRace(client, message)
{
    const num1_emote = await client.emojis.get(num1);
    const num2_emote = await client.emojis.get(num2);
    const num3_emote = await client.emojis.get(num3);
    const num4_emote = await client.emojis.get(num4);

    //Init canvas
    const trackCanvas = canvas.createCanvas(track_width, track_height);
    let cptx = trackCanvas.getContext('2d');

    let init_track_bg = await canvas.loadImage(track_bg1);
    let player1 = await canvas.loadImage(car1);
    let player2 = await canvas.loadImage(car2);
    let player3 = await canvas.loadImage(car3);
    let player4 = await canvas.loadImage(car4);

    cptx.clearRect(0, 0, track_width, track_height);
	cptx.drawImage(init_track_bg, 0, 0, trackCanvas.width, trackCanvas.height);

    cptx.drawImage(player1, 200, track_height - 55, 60, 130);
    cptx.drawImage(player2, 324, track_height - 60, 60, 130);
    cptx.drawImage(player3, 455, track_height - 60, 60, 130);
    cptx.drawImage(player4, 585, track_height - 54, 60, 130);

    let race = new Discord.Attachment(trackCanvas.toBuffer(), `race.png`);
    let raceMsg = await message.channel.send("**READY YOUR ENGINES!** Bet on which car will finish **first** (multiple bets won't be counted for)!", race);
    await raceMsg.react(client.emojis.get(num1));
    await raceMsg.react(client.emojis.get(num2));
    await raceMsg.react(client.emojis.get(num3));
    await raceMsg.react(client.emojis.get(num4));

    var car1_bets = null;
    var car2_bets = null;
    var car3_bets = null;
    var car4_bets = null;

    const reactions = await raceMsg.awaitReactions(reaction => reaction.emoji.name == num1_emote.name || reaction.emoji.name == num2_emote.name || reaction.emoji.name == num3_emote.name || reaction.emoji.name == num4_emote.name, {time: 7000, max: 100});
    try{ car1_bets = await raceMsg.reactions.get(numEmotes[0]).fetchUsers(); } catch(e) { console.log(e); }
	try{ car2_bets = await raceMsg.reactions.get(numEmotes[1]).fetchUsers(); } catch(e) { console.log(e); }
    try{ car3_bets = await raceMsg.reactions.get(numEmotes[2]).fetchUsers(); } catch(e) { console.log(e); }
    try{ car4_bets = await raceMsg.reactions.get(numEmotes[3]).fetchUsers(); } catch(e) { console.log(e); }

    finishRace(client, message, raceMsg, {bet1: car1_bets, bet2: car2_bets, bet3: car3_bets, bet4: car4_bets});
}

async function finishRace(client, message, raceMessage, bets)
{
    const num = Math.floor(Math.random() * 4) + 1;

    //Init canvas
    const trackCanvas = canvas.createCanvas(track_width, track_height);
    let cptx = trackCanvas.getContext('2d');

    let finish_track_bg = await canvas.loadImage(track_bg2);
    let player1 = await canvas.loadImage(car1);
    let player2 = await canvas.loadImage(car2);
    let player3 = await canvas.loadImage(car3);
    let player4 = await canvas.loadImage(car4);

    cptx.clearRect(0, 0, track_width, track_height);
	cptx.drawImage(finish_track_bg, 0, 0, trackCanvas.width, trackCanvas.height);

    var winnersObject = null;
    var losersObject = null;
    if(num == 1)
    {
        cptx.drawImage(player1, 200, 10, 60, 130);
        winnersObject = bets.bet1;
        losersObject = bets.bet2.concat(bets.bet3).concat(bets.bet4);
    }
    else
        cptx.drawImage(player1, 200, Math.floor(Math.random() * (track_height - 60)) + 55, 60, 130);

    if(num == 2)
    {
        cptx.drawImage(player2, 324, 10, 60, 130);
        winnersObject = bets.bet2;
        losersObject = bets.bet1.concat(bets.bet3).concat(bets.bet4);
    }
    else
        cptx.drawImage(player2, 324, Math.floor(Math.random() * (track_height - 60)) + 55, 60, 130);

    if(num == 3)
    {
        cptx.drawImage(player3, 455, 10, 60, 130);
        winnersObject = bets.bet3;
        losersObject = bets.bet2.concat(bets.bet1).concat(bets.bet4);
    }
    else
        cptx.drawImage(player3, 455, Math.floor(Math.random() * (track_height - 60)) + 55, 60, 130);

    if(num == 4)
    {
        cptx.drawImage(player4, 585, 10, 60, 130);
        winnersObject = bets.bet4;
        losersObject = bets.bet2.concat(bets.bet3).concat(bets.bet1);
    }
    else
        cptx.drawImage(player4, 585, Math.floor(Math.random() * (track_height - 60)) + 55, 60, 130);

    let results = await dupeCheck(client, winnersObject, losersObject);
    //console.log(losersObject);

    await awardWinners(client, message, results.winners);
    await awardLosers(client, message, results.losers);
    game_session.delete(message.channel.id);

    let race = new Discord.Attachment(trackCanvas.toBuffer(), `race.png`);
    if(results.winners.length >= 1)
        await message.channel.send(`Racer **#${num}** has finished **FIRST**, and **${results.winners.length}** gamblers have come out on top winning **${REWARD} Quarters!**`, race);
    else
        await message.channel.send(`Racer **#${num}** has finished **FIRST**, and **${results.winners.length}** gamblers have come out on top. No winners today.`, race);
    raceMessage.delete().catch(err => {});
}

async function dupeCheck(client, winners, losers)
{
    winners = winners.array();
    losers = losers.array();

    let cheaters = [];
    for(let i = 0; i < winners.length; i++)
        for(let k = 0; k < losers.length; k++)
            if(winners[i].id == losers[k].id)
                cheaters[cheaters.length] = i;

    //winners.splice(i, 1);
    for(let i = cheaters.length - 1; i >= 0; i--)
        winners.splice(cheaters[i], 1);

    return {winners: winners, losers: losers};
}

async function awardWinners(client, message, winners)
{
    for(let i = 0; i < winners.length; i++)
    {
        var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", winners[i].id);
        memberInfo.bal += REWARD;
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);

        var memberStats = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, "data", "id", winners[i].id);
        memberStats.raceW++;
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, memberStats);
    }
}

async function awardLosers(client, message, losers)
{
    for(let i = 0; i < losers.length; i++)
    {
        var memberStats = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, "data", "id", losers[i].id);
        memberStats.raceL++;
        await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/games/users/gamesStats.sqlite`, config.casinoSQLSetter, memberStats);
    }
}
