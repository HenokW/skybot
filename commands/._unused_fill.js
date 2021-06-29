const Discord = require("discord.js");
const config = require("../config.json");

if(typeof activeSession === 'undefined' || activeSession == null) activeSession = new Map();
if(typeof activeSessionPhrase === 'undefined' || activeSessionPhrase == null) activeSessionPhrase = new Map();
if(typeof isActive === 'undefined' || isActive == null) isActive = new Map();

var BALANCE_REWARD = 10;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    message.channel.startTyping();

    client.phrases = require ("./utils/fill_the_blanks.json");
    var totalPhrases = client.phrases.length;

    if(args[0] == "start")
    {
        //If there isn't an active session within the guild
        if(!(isActive.get(message.guild.id) == null || isActive.get(message.guild.id) == undefined || isActive.get(message.guild.id) == false))
            return message.reply("There's already an active game! Use the `fill` command to check what the current phrase is.");

        var newPhrase = client.phrases[Math.floor(Math.random() * totalPhrases)];
        if(newPhrase.length <= 15) var blanks = Math.floor(newPhrase.length / 2);
        else var blanks = Math.floor(newPhrase.length / 2) - Math.floor((newPhrase.length / 2)/2);

        activeSession.set(message.guild.id, newPhrase);
        for(var i = 0; i < blanks; i++)
        {
            var index = Math.floor(Math.random() * newPhrase.length);
            if(newPhrase[index] != " ")
                newPhrase = newPhrase.replaceAt(index, "-");
            else
            {
                i-=2;
                continue;
            }

        }
        activeSessionPhrase.set(message.guild.id, newPhrase);
        isActive.set(message.guild.id, true);
        sendPhrase(message, newPhrase);
    }

    message.channel.stopTyping();
}

function sendPhrase(message, text)
{
    var phraseEmbed = new Discord.RichEmbed()
        .setColor("#3abe24")
        .setFooter(`Current reward: ${BALANCE_REWARD} Quarters`)
        .setTimestamp()
        .addField("New Fill the Phrase", "**`" + text + "`**");

    message.channel.send({embed:phraseEmbed});
}

String.prototype.replaceAt=function(index, replacement)
{
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
