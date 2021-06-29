const Discord = require("discord.js");

config = undefined;
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    let cc = await client.guilds.get('545006544790749194').channels.get('562282905682968586');
    let mm = await cc.fetchMessage('596479685454725120');
    mm.delete();
}
