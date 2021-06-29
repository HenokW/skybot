const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("../commands/utils/sql_handler.js");

exports.main = async function(client, member)
{
    let guild_settings = await sqlHand.getData(client, `./SQL/guild_data/${member.guild.id}/channel_settings.sqlite`, "data", "id", member.guild.id);

    //If there's no welcome channel specified
    if(guild_settings.welcome_channel == null || guild_settings.welcome_channel == undefined) return;

    //Grab the user object, and change the template join message
    let joinedUser = await client.fetchUser(member.user.id);
    let welcome_message = await clean_message(guild_settings.joined_message, member);
    member.guild.channels.get(guild_settings.welcome_channel).send(welcome_message);
}

async function clean_message(template, member)
{
    let name_replacer = '{user}';
    let guild_replacer = '{server}';

    let new_template = template;
    if(template.includes(name_replacer))
        new_template = new_template.replace(name_replacer, `<@${member.id}>`);
    if(template.includes(guild_replacer))
        new_template = new_template.replace(guild_replacer, member.guild.name);

    return new_template;
}
