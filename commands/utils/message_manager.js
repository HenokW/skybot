const Discord = require("discord.js");
const convertTime = require("hh-mm-ss");
const storage = require("node-persist");
const fs = require('fs');

if(typeof hasSetup === 'undefined') var hasSetup = false;
if(typeof isRunning === 'undefined') var isRunning = false;

const yes_emote = "success_emote:567699131733245992";
const no_emote = "warning_emote:559030535540834324";
const idk_emote = "question_emote:595676254905171978";

const numEmotes = ['<:num1:572583074072887306>', '<:num2:572583074441854976>',
                '<:num3:579508950118957063>', '<:num4:579508952090279960>',
                '<:num5:579508952622956554>', '<:num6:579508952652316691>',
                '<:num7:579508952484675596>', '<:num8:579508952702648360>', '<:num9:579508952463835147>'];

const numEmotesArr = ['num1:572583074072887306', 'num2:572583074441854976',
                'num3:579508950118957063', 'num4:579508952090279960',
                'num5:579508952622956554', 'num6:579508952652316691',
                'num7:579508952484675596', 'num8:579508952702648360', '<:num9:579508952463835147'];

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
        var job_count = await storage.getItem("JOB_COUNT");
        if(job_count.length <= 0) return;

        //Resume our jobs
        main(client);
    }
    catch(e) { client.emit("error", e); return; }
}

module.exports.add = async(client, message, type, duration, pollCmdMsg) =>
{
    try
    {
        if(!hasSetup)
            await setup(storage);

        let currTime = Math.round((new Date()).getTime() / 1000);
        let jobs = (await storage.getItem("JOB_COUNT")).length + 1;

        console.log(jobs);
        var durationChar = duration[duration.length-1];
        var duration = duration.substring(0, duration.length-1) * 1;
        switch(durationChar)
        {
            case "s":
                var endTime = duration * 1 + currTime;
                break;
            case "m":
                var endTime = duration * 60 + currTime;
                break;
            case "h":
                var endTime = duration * 3600 + currTime;
                break;
            case "d":
                var endTime = duration * 86400 + currTime;
                break;
            default:
                return message.reply("please specify how long you would like the poll to run for next time.");

        }
        let idNum = await getRandomID(client);
        let newVal = await storage.getItem("JOB_COUNT");
        newVal[jobs - 1] = idNum;

        await storage.setItem("JOB_COUNT", newVal);
        await storage.setItem(`JOB${idNum}`, JSON.stringify(
        {
            type: type,
            id: idNum,
            message:
            {
                id: message.id,
                channelID: message.channel.id,
                guildID: message.guild.id,
            },
            currTime: currTime,
            endTime: endTime,
            expired: false
        }));

        switch(type)
        {
            case "yn":
                pollCmdMsg.reply("your poll has successfully been created!");
                break;
            case "mc":
                pollCmdMsg.reply("your poll has successfully been created!");
                break;
            case "event":
                pollCmdMsg.reply("your event has successfully been created!");
                break;
        }
        if(!isRunning)
            main(client);
    }
    catch(e)
    {
        if(e.message.toLowerCase().includes("length"))
        {
            switch(type)
            {
                case "yn":
                    pollCmdMsg.reply("please specify the event signup duration. Use the `poll help` command for an example.");
                    break;
                case "mc":
                    pollCmdMsg.reply("please specify the event signup duration. Use the `poll help` command for an example.");
                    break;
                case "event":
                    pollCmdMsg.reply("please specify the event signup duration. Use the `event help` command for an example.");
                    break;
            }
            return message.delete();
        }
    }
}


module.exports.stop = async(client, message, id) =>
{
    if(!hasSetup)
        await setup(storage);

    let job_count = await storage.getItem("JOB_COUNT");
    for(let i = 0; i < job_count.length; i++)
    {
        let job = await storage.getItem(`JOB${job_count[i]}`);
        let currJob = await JSON.parse(job);

        //Check if their IDs match, and if the returning guild matches
        if(currJob.id == id)
        {
            let ogChannel = await client.guilds.get(currJob.message.guildID).channels.get(currJob.message.channelID);
            let oggMsg = await ogChannel.fetchMessage(currJob.message.id);

            //If the job ID message doesn't match the requested users guild
            if(oggMsg.guild.id != message.guild.id) continue;

            currJob.endTime = 0;
            await storage.setItem(`JOB${job_count[i]}`, JSON.stringify(currJob));
            await actionHandler(client, currJob.id, oggMsg);
            // await shiftJobs(i);
            // await oggMsg.delete();

            return message.reply(`item **ID:** ${id} has successfully ended.`);
        }
    }

    return message.reply(`unable to find item **ID: ${id}**`);
}

async function main(client)
{
    //Basic checks to make sure we're supposed to be here, and not run if there are no more jobs
    let jobs = await storage.getItem("JOB_COUNT");
    if(jobs.length <= 0)
    {
        hasSetup = false;
        isRunning = false;
        //storage.clear();
        return;
    }
    if(!isRunning) isRunning = true;

    let tempJobLoop;
    main_loop:
    for(let i = 0; i < jobs.length; i++)
    {
        tempJobLoop = i;
        try
        {
            let value = await storage.getItem(`JOB${jobs[i]}`);
            let currItem = await JSON.parse(value);

            //If the job has been expired, let's move on
            if(currItem.expired == true)
            {
                await shiftJobs(jobs[i]);
                continue;
            }

            //Increment the time by 1 (a second), then save it
            currItem.currTime = Math.round((new Date()).getTime() / 1000);
            let goalTime = new Date(currItem.endTime * 1000).toUTCString();
            await storage.setItem(`JOB${jobs[i]}`, JSON.stringify(currItem));

            let ogChannel = await client.guilds.get(currItem.message.guildID).channels.get(currItem.message.channelID);
            let ogMsg = await ogChannel.fetchMessage(currItem.message.id);

            let rebuiltMsg = new Discord.RichEmbed()
                .setColor(ogMsg.embeds[0].color)
                .setTitle(ogMsg.embeds[0].title)
                .setAuthor(ogMsg.embeds[0].author.name, ogMsg.embeds[0].author.iconURL)
                .setDescription(ogMsg.embeds[0].description)
                .setFooter(`ID: ${currItem.id} | Time remaining: ${convertTime.fromS(currItem.endTime - currItem.currTime)} | Closes: ${goalTime}`);
                //.setTimestamp(goalTime);
            await ogMsg.edit({embed:rebuiltMsg});
            //Check to see if our current time has reached our goal time yet
            if(currItem.endTime - currItem.currTime <= 0)
            {
                try
                {
                    //Invalidate the job, and save
                    currItem.expired = true;
                    await storage.setItem(`JOB${jobs[i]}`, JSON.stringify(currItem));

                    console.log("DONE!");
                    await actionHandler(client, jobs[i], rebuiltMsg);

                    //Let's delete, and shift all our jobs down
                    await shiftJobs(jobs[i]);
                    break main_loop;
                } catch(e) { client.emit("error", e); }
            }
        } //End of Try-block
        catch(e)
        {
            client.emit("error", e);
            if(e.message.toLowerCase().includes("unknown message") || e.message.toLowerCase().includes("color"))
                await shiftJobs(jobs[tempJobLoop]);
        }
    }
    setTimeout(function() { main(client); }, 1200);
}

async function shiftJobs(index)
{
    let jobCount = await storage.getItem("JOB_COUNT");
    for(let i = 0; i < jobCount.length; i++)
        if(jobCount[i] == index)
        {
            //Since we're splicing, we should just remove the item, and reset JOB_COUNT
            if(jobCount.length == 1)
            {
                await storage.setItem("JOB_COUNT", []);
                return await storage.removeItem(`JOB${index}`);
            }

            jobCount.splice(i, 1);
            break;
        }

    await storage.setItem("JOB_COUNT", jobCount);
    return await storage.removeItem(`JOB${index}`);

    /*
    var total_jobs = await storage.getItem("JOB_COUNT");
    if(index > total_jobs)
        return await storage.setItem("JOB_COUNT", total_jobs - 1);

    if(index == total_jobs)
        return await storage.removeItem(`JOB${index}`);

    var nextJob = await storage.getItem(`JOB${index+1}`)
    await storage.setItem(`JOB${index}`, nextJob);
    await shiftJobs(index+1);
    */
}

async function actionHandler(client, index, expiredPoll)
{
    /*
        ===STEPS:===
        1.) Collect the results for the job provided
        2.) clear the polls emojis
        3.) Post a new message containing results for the linking poll
        4.) Update the expired poll with a new linked message containing a redirect to the results message
        ============
    */

    let value = await storage.getItem(`JOB${index}`);
    let currItem = JSON.parse(value);

    let ogChannel = await client.guilds.get(currItem.message.guildID).channels.get(currItem.message.channelID);
    let oggMsg = await ogChannel.fetchMessage(currItem.message.id);

    switch(currItem.type)
    {
        case "yn":
            //Grabbing the count for YN polls, then clear the reactions
            var yay_count = undefined;
            var nay_count = undefined;
            var reacted_users = undefined;

            try
            {
                yay_count = await oggMsg.reactions.get(yes_emote).count;
                nay_count = await oggMsg.reactions.get(no_emote).count;
                const yn_yes_users = await oggMsg.reactions.get(yes_emote).fetchUsers();
                const yn_no_users = await oggMsg.reactions.get(no_emote).fetchUsers();

                let temp = "";
                temp = `${temp}== || Users who voted YES || ==\n`;
                for(let k = 0; k < yn_yes_users.array().length; k++)
                    temp = `${temp}- ${yn_yes_users.array()[k].username}#${yn_yes_users.array()[k].discriminator}  ||  User ID: ${yn_yes_users.array()[k].id}\n`;

                temp = `${temp}\n== || Users who voted NO || ==\n`;
                for(let k = 0; k < yn_no_users.array().length; k++)
                    temp = `${temp}- ${yn_no_users.array()[k].username}#${yn_no_users.array()[k].discriminator}  ||  User ID: ${yn_no_users.array()[k].id}\n`;

                reacted_users = temp;
            } catch(e) { client.emit("error", e); }
            oggMsg.clearReactions();

            var resultsEmbed = new Discord.RichEmbed()
                //.setColor("#8924be")
                .setColor("#be243e")
                .setTitle("Poll Results - Yes | No")
                .setAuthor(oggMsg.embeds[0].author.name, oggMsg.embeds[0].author.iconURL)
                .setDescription(oggMsg.embeds[0].description)
                .addField("Results:",
                    `<:${yes_emote}> = **${yay_count}**\n` +
                    `<:${no_emote}> = **${nay_count}**`)
                .setFooter(`Poll Results`)
                .setTimestamp();

            //var resultsMsg = await ogChannel.send({embed:resultsEmbed});
            // expiredPoll.setDescription(`[View poll results](${resultsMsg.url})`)
            //     .setColor("#be243e")
            //     .setTitle("Yes | No Poll Closed")
            //     .setFooter("Poll closed");

            oggMsg.edit({embed:resultsEmbed});
            if(currItem.message.guildID == 545006544790749194)
            {
                let newMsgData = `=== Poll Description ===\n${oggMsg.embeds[0].description}\n====================\n\n${reacted_users}`;
                await fs.writeFileSync(`./SQL/guild_data/${oggMsg.guild.id}/Poll${currItem.id}.txt`, newMsgData, 'utf8', (err) => { if(err) client.emit("error", err); });

                var resultsMsg = await client.guilds.get('545006544790749194').channels.get('595450357379760128').send({embed:resultsEmbed, file: `./SQL/guild_data/${oggMsg.guild.id}/Poll${currItem.id}.txt`});
            }
            break;
        case "mc":
            var mcResults = [];
            var reacted_users = undefined;

            //There's more than likely a better way to do this, but we'll search for each emote,
            // and stop once we've hit an error
            try
            {
                let temp = "";
                for(var i = 0; i <= 9; i++)
                {
                    mcResults[i] = await oggMsg.reactions.get(numEmotesArr[i]).count;
                    mc_users = await oggMsg.reactions.get(numEmotesArr[i]).fetchUsers();

                    temp = `${temp}\n== || Users who voted ${i + 1} || ==\n`;
                    for(let k = 0; k < mc_users.array().length; k++)
                        temp = `${temp}- ${mc_users.array()[k].username}#${mc_users.array()[k].discriminator}  ||  User ID: ${mc_users.array()[k].id}\n`;
                    reacted_users = temp;
                }
            } catch(e) {console.log(e);}
            oggMsg.clearReactions();

            var outputResults = "";
            for(var i = 0; i < mcResults.length; i++)
                outputResults = `${outputResults}${numEmotes[i]} **- ${mcResults[i]}**\n`

            var mcResultsEmbed = new Discord.RichEmbed()
                //.setColor("#8924be")
                .setColor("#be243e")
                .setTitle("Poll Results - Multiple Choice")
                .setAuthor(oggMsg.embeds[0].author.name, oggMsg.embeds[0].author.iconURL)
                .setDescription(oggMsg.embeds[0].description)
                .addField("Results:", outputResults)
                .setFooter(`Poll Results`)
                .setTimestamp();

            //var mcResultsMsg = await ogChannel.send({embed:mcResultsEmbed});
            // expiredPoll.setDescription(`[View poll results](${mcResultsMsg.url})`)
            //     .setColor("#be243e")
            //     .setTitle("Multiple Choice Poll Closed")
            //     .setFooter("Poll closed");

            oggMsg.edit({embed:mcResultsEmbed});

            if(currItem.message.guildID == 545006544790749194)
            {
                let newMsgData = `=== Poll Description ===\n${oggMsg.embeds[0].description}\n====================\n\n${reacted_users}`;
                await fs.writeFileSync(`./SQL/guild_data/${oggMsg.guild.id}/Poll${currItem.id}.txt`, newMsgData, 'utf8', (err) => { if(err) client.emit("error", err); });

                var resultsMsg = await client.guilds.get('545006544790749194').channels.get('595450357379760128').send({embed:mcResultsEmbed, file: `./SQL/guild_data/${oggMsg.guild.id}/Poll${currItem.id}.txt`});
            }
            break;

        case "event":
            var yay_count = undefined;
            var nay_count = undefined;
            var und_count = undefined;
            var reacted_users = undefined;

            let temp = "";
            try
            {
                yay_count = await oggMsg.reactions.get(yes_emote).count;
                nay_count = await oggMsg.reactions.get(no_emote).count;
                und_count = await oggMsg.reactions.get(idk_emote).count;

                const event_yes_users = await oggMsg.reactions.get(yes_emote).fetchUsers();
                const event_no_users = await oggMsg.reactions.get(no_emote).fetchUsers();
                const event_idk_users = await oggMsg.reactions.get(idk_emote).fetchUsers();
                reacted_users = await oggMsg.reactions.get(yes_emote).users.array();

                temp = `${temp}\n== || Users who voted YES || ==\n`;
                for(let k = 0; k < event_yes_users.array().length; k++)
                    temp = `${temp}- ${event_yes_users.array()[k].username}#${event_yes_users.array()[k].discriminator}  ||  User ID: ${event_yes_users.array()[k].id}\n`;

                temp = `${temp}\n== || Users who voted NO || ==\n`;
                for(let k = 0; k < event_no_users.array().length; k++)
                    temp = `${temp}- ${event_no_users.array()[k].username}#${event_no_users.array()[k].discriminator}  ||  User ID: ${event_no_users.array()[k].id}\n`;

                temp = `${temp}\n== || Users who voted UNDECIDED || ==\n`;
                for(let k = 0; k < event_idk_users.array().length; k++)
                    temp = `${temp}- ${event_idk_users.array()[k].username}#${event_idk_users.array()[k].discriminator}  ||  User ID: ${event_idk_users.array()[k].id}\n`;

                reacted_users = temp;
            } catch(e) { client.emit("error", e); }
            oggMsg.clearReactions();

            let ipResultsEmbed = new Discord.RichEmbed()
                //.setColor("#8924be")
                .setColor("#be243e")
                .setTitle("Event Signup Results")
                .setAuthor(oggMsg.embeds[0].author.name, oggMsg.embeds[0].author.iconURL)
                .setDescription(oggMsg.embeds[0].description)
                .addField("Results:",
                    `<:${yes_emote}> = **${yay_count}**\n` +
                    `<:${no_emote}> = **${nay_count}**\n` +
                    `<:${idk_emote}> = **${und_count}**\n` +
                    `To view everyone who reacted, download the attached file.`)
                .setFooter(`Poll Results`)
                .setTimestamp();

            var newData = `=== Event Description ===\n${oggMsg.embeds[0].description}\n====================\n\n${reacted_users}`;
            await fs.writeFileSync(`./SQL/guild_data/${oggMsg.guild.id}/Event${currItem.id}.txt`, newData, 'utf8', (err) => { if(err) client.emit("error", err); });

            //var resultsMsg = await ogChannel.send({file: `./SQL/guild_data/${oggMsg.guild.id}/Event${currItem.id}.txt`});
            await oggMsg.edit({embed:ipResultsEmbed});
            if(currItem.message.guildID == 545006544790749194)
                await client.guilds.get('545006544790749194').channels.get('595450357379760128').send({embed:ipResultsEmbed, file: `./SQL/guild_data/${oggMsg.guild.id}/Event${currItem.id}.txt`});

            fs.unlinkSync(`./SQL/guild_data/${oggMsg.guild.id}/Event${currItem.id}.txt`);

            // expiredPoll.setDescription(`[View poll results](${resultsMsg.url})`)
            //     .setColor("#be243e")
            //     .setTitle("Event Signup Closed")
            //     .setFooter("Event signup closed");


            //oggMsg.edit({embed:ipResultsEmbed, file: `./SQL/guild_data/${oggMsg.guild.id}/Poll${currItem.id}.txt`});
            break;
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
            var jobCount = await storage.getItem("JOB_COUNT");

            if(jobCount.length <= 0) return num;
            for(let i = 0; i < jobCount.length; i++)
            {
                let thisJob = await storage.getItem(`JOB${jobCount[i]}`);
                let currJob = JSON.parse(thisJob);
                if(currJob.id == num)
                    break;

                if(i >= jobCount.length - 1)
                    return num;
            }
        }
        catch(e)
        {
            client.emit("error", `>> Error found while grabbing a Job ID:\n${e}`);
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

    var temp = await storage.getItem("JOB_COUNT");
    if(typeof temp === 'undefined')
        await storage.setItem("JOB_COUNT", []);

    hasSetup = true;
}
