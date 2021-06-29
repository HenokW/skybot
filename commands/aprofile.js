const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const axios = require('axios');

config = undefined;
const notifGre = '<:accept:566645744359047178>';
const notifRed = '<:deny:566645744476618772>';
const pcMoji = '<:pc:566636347289370644>';
const xbMoji = '<:xb:566636347553742888>';
const psnMoji = '<:psn:566636347444428811>';

var SQL_COUNTER = 0; //Ensure we don't close the connection in the middle of another save

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, config) =>
{
    message.channel.startTyping();

    this.config = config;
    var request = axios.create(
    {
        headers:
        {
            'Authorization': config.apexKey
        }
    });

    try { mentionedUser = message.mentions.members.first().user; } catch(e) { mentionedUser = undefined; }
    if(mentionedUser == undefined || mentionedUser == null) //No other arg passed
        var apexProfile = getSqlData(client, message.author.id)
    else
        var apexProfile = getSqlData(client, mentionedUser.id)

    //If the message sender doesn't have their profile saved yet
    if(!apexProfile) return invalidProfile(message, guildPrefix);


    //Grab the response, and check to make sure it's a valid profile
    var response = await request.get(`http://api.mozambiquehe.re/bridge?version=2&platform=${apexProfile.platform}&player=${apexProfile.username}`).catch(err => { var response = null; });
    if(response == null) //For some reason we failed, there should probably be a way to notify devs of detailed errors
        return message.channel.send(`${message.author}, there was an issue returning the requested profile.`);

    //Let the user know which profile we've saved--
    return successMessage(message, response.data, apexProfile.username, apexProfile.platform)
}

function getSqlData(client, id)
{
    SQL_COUNTER++;

    var playerSQL = new SQLite(`./SQL/apex_data/apexProfiles.sqlite`);
    var table = playerSQL.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name= 'data';").get();
    if(!table['count(*)'])
    {
        playerSQL.prepare("CREATE TABLE data (id TEXT, username TEXT, platform TEXT);").run();
        playerSQL.prepare("CREATE UNIQUE INDEX idx_userid_id ON data (id);").run();
        playerSQL.pragma("synchronous = 1");
        playerSQL.pragma("journal_mode = wal");
    }

    client.getData = playerSQL.prepare("SELECT * FROM data WHERE id = ?");

    var userData = client.getData.get(id);

    SQL_COUNTER--;
    if(SQL_COUNTER <= 0)
        playerSQL.close();

    return userData;
}

async function successMessage(message, res, username, platform)
{
    if(platform == "PC") var platMoji = pcMoji;
    else if(platform == "X1") var platMoji = xbMoji;
    else var platMoji = psnMoji;

    if(res.realtime.isOnline == 0)
        var onlineState = "Offline";
    else
        var onlineState = "Online";

    var inGameState = await checkState(res.realtime.isInGame);
    var isFullParty = await checkState(res.realtime.partyFull);
    var isJoinable = await checkState(res.realtime.canJoin);
    var randLeg = await randomLegend(res);

    var lobbyState = (res.realtime.lobbyState)[0].toUpperCase() + (res.realtime.lobbyState).slice(1);

    var success = new Discord.RichEmbed()
        .setColor("#FFFFFF") //3abe24
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        // .setTitle("Profile Succesfully Saved!")
        .setThumbnail(randLeg.ImgAssets.icon)
        .setTitle(`${platMoji} ${res.global.name} || Level ${res.global.level}`)
        .addField("Lobby information",
        `**Lobby State:** ${lobbyState}\n` +
        `**Is In-game:** ${inGameState}\n` +
        `**Joinable Lobby:** ${isJoinable}\n` +
        `**Full Party:** ${isFullParty}`, true)
        .setFooter(`Online Status: ${onlineState}`)
        .setTimestamp();

    message.channel.stopTyping();
    return message.channel.send({embed:success});
}

function checkState(state)
{
    if(state == 0)
        return notifRed;

    return notifGre;
}

function randomLegend(res)
{
    var legends = ["Bangalore", "Bloodhound", "Lifeline", "Caustic", "Gibraltar", "Mirage", "Pathfinder", "Wraith", "Octane"];

    leg = legends[Math.floor(Math.random() * legends.length)];
    if(leg == "Bangalore")
        return res.legends.all.Bangalore;
    else if(leg == "Bloodhound")
        return res.legends.all.Bloodhound;
    else if(leg == "Lifeline")
        return res.legends.all.Lifeline;
    else if(leg == "Caustic")
        return res.legends.all.Caustic;
    else if(leg == "Gibraltar")
        return res.legends.all.Gibraltar;
    else if(leg == "Mirage")
        return res.legends.all.Mirage;
    else if(leg == "Pathfinder")
        return res.legends.all.Pathfinder;
    else if(leg == "Wraith")
        return res.legends.all.Wraith;
    else if(leg == "Octane")
        return res.legends.all.Octane;

    return res.legends.all.Mirage;
}

function invalidProfile(message, prefix)
{
    var failed = new Discord.RichEmbed()
        .setColor("#be243e")
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
        .setTitle("Profile not available")
        .setDescription(`I can't seem to find data for ${message.author}.` + " To save your profile, please use the command: `" + prefix + "asave <Username> <Platform>`")
        .addField("Available Platforms", "PC, PS4, X1");

    message.channel.stopTyping();
    return message.channel.send({embed:failed});
}
