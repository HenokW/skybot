const Discord = require("discord.js");
const SQLite = require("better-sqlite3");

bannedWordsList = undefined;
config = undefined;
//----------
const warnLogChannel = '548657162092544010'; //548657162092544010
const warnLogChannel2 = '555824593726603265' //tog-bot-channel
const defaultGuild = '541420301049790464'; //541420301049790464
//----------
const profanityCheckDisabled = false;

//----------
module.exports.run = async(client, message, args, config) =>
{
   this.config = config;
   bannedWordsList = client.bannedWordsList = require ("../admin_control/utils/banned_words.json");
   if(!message.author.bot)
   {
      //First check if the user sent a "foul" messages
      if(!profanityCheckDisabled)
         profanityCheck(client, message, args);
      //Then we'll check to see if they're spamming the same message
      //====THIS IS ALREADY CHECKED IN OUR MAIN FILE BY AN ANTISPAM MODULE====
      //If not are they sending messages in quick succession?
      //====THIS IS ALREADY CHECKED IN OUR MAIN FILE BY AN ANTISPAM MODULE====
      //Check if their message contains a large amount of emotes

      //If all else fails, the message is clean!
   }
   else return;
}

function profanityCheck(client, message, args)
{
   messageArray = args;
   for(_bw = 0; _bw < bannedWordsList["words"].length; _bw++)
   {
      for(_ma = 0; _ma < messageArray.length; _ma++)
      {
         if(messageArray[_ma].toLowerCase() == (bannedWordsList["words"][_bw]))
         {
            message.delete().catch(err =>
            {
               console.log(err);
               //errorMsg(client, message, "Missing permissions, I'm unable to moderate without them! Please enable 'Manage Messages' within my settings.", Discord);
            });
            warnUser(client, message, true, false, false, false);
         }
      }
   }
}

async function warnUser(client, message, check1, check2, check3, check4)
{
   /*
   ==========What do the checks mean?==========
   Check1 = The user has sent a message that triggered the profanity filter
   Check2 = The user has spammed the same message a certain amount of times
   Check3 = The user has spammed in quick succession
   Check4 = The user has sent a message containing a large amount of emotes
   ============================================
   */
   //=============SQL===============
   //Pointer file
   guildPFile = new SQLite(`./SQL/guild_data/${message.guild.id}/moderation/pointerFile.sqlite`);
   client.getGuildPointerData = guildPFile.prepare("SELECT * FROM data WHERE id = ?");
   client.setGuildPointerData = guildPFile.prepare("INSERT OR REPLACE INTO data(id, offenses) VALUES (@id, @offenses);");
   let offendingUsersFile = client.getGuildPointerData.get(message.author.id);

   //User offenses db
   offenseSheet = new SQLite(`./SQL/guild_data/${message.guild.id}/moderation/users/${message.author.id}.sqlite`);
   client.getUserOffenseData = offenseSheet.prepare("SELECT * FROM data WHERE offense = ?");
   client.setUserOffenseData = offenseSheet.prepare("INSERT OR REPLACE INTO data(offense, botWarning, userWarning, reason, staff) VALUES (@offense, @botWarning, @userWarning, @reason, @staff);");

   //Since we're going to allow users to delete certain warnings / offenses, we should search for a free spot
   offenseNum = 1;
   for(_find = 0; _find < 9000; _find++)
   {
      offendingUser = client.getUserOffenseData.get(_find);
      if(!offendingUser)
      {
         offenseNum = _find;
         break;
      }
   }
   //===============================

   //====DEFAULT WARNING MESSAGEs====
   const warnCount = offendingUsersFile.offenses;
   const warnLogs = new Discord.RichEmbed()
      .setColor('#DC143C')
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .setThumbnail(message.author.displayAvatarURL)
      .setTitle("A User Has Been Warned")
      .setFooter(`This user now has ${warnCount} Warnings`)
      .setTimestamp();

   //The users offending message
   const defaultMessage = new Discord.RichEmbed()
      .setColor('#1E90FF')
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .setThumbnail(message.author.displayAvatarURL)
      .setDescription(message.content)
      .setFooter("An offending message attachment")
      .setTimestamp();

   //Let's the user know they've been warned publicly
   const warnUser = new Discord.RichEmbed()
      .setColor('#DC143C')
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
      .setThumbnail(message.author.displayAvatarURL)
      .setDescription(`${message.author}, has ben warned for offensive language.`)
      .setTitle("Warning")
      .setFooter(`This user now has ${warnCount} Warnings`)
      .setTimestamp();
   //================================

   //We'll check which warning was recieved, and display a different message for each
   reason = "";
   if(check1)
      reason = `The user ${message.author}, has been warned for using profanity. The offending message will be displayed below.`;
   else if(check2)
      reason = `The user ${message.author}, has been warned for repeated messaging. The offending message will be displayed below.`;
   else if(check3)
      reason = `The user ${message.author}, has been warned for spamming messages in quick succession. The offending message will be displayed below.`;
   else if(check4)
      reason = `The user ${message.author}, has been warned for emoji overflow. Their message has contained a large amount of emojies. The offending message will be displayed below.`;
   warnLogs.setDescription(reason);

   //--
   offendingUsersFile.offenses++;
   //-
   // offendingUser.offense = offenseNum;
   // offendingUser.botWarning = 1;
   // offendingUser.userWarning = 0;
   // offendingUser.reason = reason;

   data =
   {
      offense: offenseNum,
      botWarning: 1,
      userWarning: 0,
      reason: reason,
      staff: "Automated Moderation"
   }

   client.setUserOffenseData.run(data);
   client.setGuildPointerData.run(offendingUsersFile)

   guildPFile.close();
   offenseSheet.close();
   
  // await message.channel.send()

   if(message.guild.id == defaultGuild)
   {
      await client.guilds.get(defaultGuild).channels.get(warnLogChannel).send({embed:warnLogs}); //Warning message
      await client.guilds.get(defaultGuild).channels.get(warnLogChannel).send({embed:defaultMessage}); //Offending message
   }
   else
   {
      await message.channel.send({embed:warnLogs}); //Warning message
      await message.channel.send({embed:defaultMessage}); //Offending message
   }
}