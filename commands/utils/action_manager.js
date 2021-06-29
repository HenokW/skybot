const Discord = require("discord.js");
const convertTime = require("hh-mm-ss");
const storage = require("node-persist");
const antispam = require("./anti-spam.js");
const fs = require('fs');

if(typeof hasSetup === 'undefined') var hasSetup = false;
if(typeof isRunning === 'undefined') var isRunning = false;

module.exports.run = async(client, message, type) =>
{
    if(!hasSetup)
        await setup();
}

//Module runs on bot startup checking if we have any jobs to resume.
module.exports.startup = async(client) =>
{
    try
    {
        await setup(storage);

        //Get our jobs count if it exists
        var action_count = await storage.getItem("ACTION_COUNT");
        if(action_count.length <= 0) return;

        //Resume our jobs
        main(client);
    }
    catch(e) { client.emit("error", e); return; }
}

module.exports.add = async(client, message, type, duration, user) =>
{
    try
    {
        if(!hasSetup)
            await setup(storage);

        let currTime = Math.round((new Date()).getTime() / 1000);
        let actions = (await storage.getItem("ACTION_COUNT")).length + 1;

        console.log(actions);
        let idNum = await getRandomID(client);
        let newVal = await storage.getItem("ACTION_COUNT");
        newVal[actions - 1] = idNum;

        await storage.setItem("ACTION_COUNT", newVal);
        await storage.setItem(`ACTION${idNum}`, JSON.stringify(
        {
            type: type,
            id: idNum,
            info:
            {
                userID: user.id,
                guildID: message.guild.id
            },
            endTime: currTime + duration,
            expired: false
        }));

        if(!isRunning)
            main(client);
    }
    catch(e)
    {
        console.error(e);
    }
}


module.exports.stop = async(client, message, id) =>
{
    if(!hasSetup)
        await setup(storage);

    let action_count = await storage.getItem("ACTION_COUNT");
    for(let i = 0; i < action_count.length; i++)
    {
        let action = await storage.getItem(`ACTION${action_count[i]}`);
        let currJob = await JSON.parse(action);

        //Check if their IDs match, and if the returning guild matches
        if(currJob.id == id)
        {
            currJob.endTime = 0;
            await storage.setItem(`ACTION${action_count[i]}`, JSON.stringify(currJob));
            await actionHandler(client, currJob.id);

            return message.reply(`action **ID:** ${id} has successfully ended.`);
        }
    }

    return message.reply(`unable to find item **ID: ${id}**`);
}

async function main(client)
{
    //Basic checks to make sure we're supposed to be here, and not run if there are no more jobs
    let action_count = await storage.getItem("ACTION_COUNT");
    if(action_count.length <= 0)
    {
        hasSetup = false;
        isRunning = false;
        return;
    }
    if(!isRunning) isRunning = true;

    let tempJobLoop;
    main_loop:
    for(let i = 0; i < action_count.length; i++)
    {
        tempJobLoop = i;
        try
        {
            let value = await storage.getItem(`ACTION${action_count[i]}`);
            let currItem = await JSON.parse(value);

            //If the job has been expired, let's move on
            if(currItem.expired == true)
            {
                await shiftJobs(action_count[i]);
                continue;
            }

            //Check to see if our current time has reached our goal time yet
            let currTime = Math.round((new Date()).getTime() / 1000);
            console.log(currItem.endTime - currTime);
            if(currItem.endTime - currTime <= 0)
            {
                try
                {
                    //Invalidate the job, and save
                    currItem.expired = true;
                    await storage.setItem(`ACTION${action_count[i]}`, JSON.stringify(currItem));

                    console.log("DONE!");
                    await actionHandler(client, action_count[i]);

                    //Let's delete, and shift all our action_count down
                    await shiftJobs(action_count[i]);
                    break main_loop;
                } catch(e) { client.emit("error", e); }
            }
        } //End of Try-block
        catch(e)
        {
            client.emit("error", e);
            if(e.message.toLowerCase().includes("unknown message") || e.message.toLowerCase().includes("color"))
                await shiftJobs(action_count[tempJobLoop]);
        }
    }
    setTimeout(function() { main(client); }, 1200);
}

async function shiftJobs(index)
{
    let actionCount = await storage.getItem("ACTION_COUNT");
    for(let i = 0; i < actionCount.length; i++)
        if(actionCount[i] == index)
        {
            //Since we're splicing, we should just remove the item, and reset ACTION_COUNT
            if(actionCount.length == 1)
            {
                await storage.setItem("ACTION_COUNT", []);
                return await storage.removeItem(`ACTION${index}`);
            }

            actionCount.splice(i, 1);
            break;
        }

    await storage.setItem("ACTION_COUNT", actionCount);
    return await storage.removeItem(`ACTION${index}`);
}

async function actionHandler(client, index)
{

    try
    {
        let value = await storage.getItem(`ACTION${index}`);
        let currItem = JSON.parse(value);

        let ogGuild = await client.guilds.get(currItem.info.guildID);
        let ogUser = await ogGuild.members.find(members => members.id == currItem.info.userID);

        switch(currItem.type)
        {
            case "mute":
                let mutedRoleName = antispam.roleName;
                let mutedRole = await ogGuild.roles.find(role => role.name == mutedRoleName);

                if(await ogUser.roles.find(role => role.id == mutedRole.id))
                {
                    await antispam.unmuted(currItem.info.guildID, currItem.info.userID);
                    await ogUser.removeRole(mutedRole);
                }
                break;
        }
    }
    catch(e)
    {
        console.error(e);
        //Ignore because the user probably isn't in the guild anymore, or the bot may not be in the guild anymore
    }
}


async function getRandomID(client)
{
    const idLimit = 1000;
    while(true)
    {
        try
        {
            var num = Math.floor(Math.random() * idLimit) + 1;
            var actionCount = await storage.getItem("ACTION_COUNT");

            if(actionCount.length <= 0) return num;
            for(let i = 0; i < actionCount.length; i++)
            {
                let thisJob = await storage.getItem(`ACTION${actionCount[i]}`);
                let currJob = JSON.parse(thisJob);
                if(currJob.id == num)
                    break;

                if(i >= actionCount.length - 1)
                    return num;
            }
        }
        catch(e)
        {
            client.emit("error", `>> Error found while grabbing an Action ID:\n${e}`);
        }
    }
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

    var temp = await storage.getItem("ACTION_COUNT");
    if(typeof temp === 'undefined')
        await storage.setItem("ACTION_COUNT", []);

    hasSetup = true;
}
