const Discord = require("discord.js");
const SQLite = require("better-sqlite3");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    fillname = args[0];

    try
    {
        /*
        var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

        memberObject = Object.keys(memberInfo);
        memberObjectValues = Object.values(memberInfo);
        memberEntries = Object.entries(memberInfo);

        for(var i = 0; i < memberObject.length; i++)
            if(memberObject[i] == fillname)
            {
                message.reply(memberObjectValues[i]);
                memberObjectValues[i] += 20;
                break;
            }

        var rv = await sqlHand.merge(memberObject, memberObjectValues);
        await sqlHand.setData(client, `./SQL/guild_data/${guild.id}/members/member_data.sqlite`, config.usersSQLSetter, rv);
        */

        //client.setMemberData.run(rv);
        //memberSQL.close();
        //leave_channel, leave_message

        if(args[0] == undefined) return message.reply("please specify a column name");
        await sqlHand.createColumn(client, {name: args[0], type: 'INTEGER'});

        // client.createColumnData = memberSQL.prepare(`ALTER TABLE data ADD COLUMN ${fillname} TEXT;`)
    	// // client.getMemberData = memberSQL.prepare("SELECT * FROM data WHERE id = ?");
    	// //client.setMemberData = memberSQL.prepare(config.usersSQLSetter2);
        // //client.setMemberData.run(memberInfo);
        // //
    	// client.createColumnData.run();
        // memberSQL.close();
    } catch(e) { console.error(e); }
}
