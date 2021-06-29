const Discord = require("discord.js");
const config = require("../config.json");
const sqlHand = require("./utils/sql_handler.js");
const fs = require('fs');

module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
    let tester = await message.guild.fetchMember(message.author.id);
    client.emit('guildMemberRemove', tester);


    // let temp = "Henok Wondasan";
    // const data = new Uint8Array(Buffer.from('Hello Node.js'));
    //
    // await fs.writeFileSync("./SQL/responses.txt", temp, 'utf8', (err) =>
    // {
    //     if(err)
    //         console.error( err);
    //     console.log("File saved!");
    // });
    //
    // await message.reply({file:'./SQL/responses.txt'});
    // fs.unlinkSync('./SQL/responses.txt');



    //await fs.createWriteStream(`./SQL/guild_data/${message.guild.id}/response.txt`, temp).catch(err => console.error( err));

}
