/*
=== BUGS ===

=== LOOKING TO DO ===
- Add support for SoundCloud (links)

= Needed Commands =
- leave ( DONE )
- pause/unpause ( DONE )
- musicQueue ( DONE )
- remove

=== OTHER ===
*/

const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const fs = require("fs");

const debugText = true;
const musicQueueLimit = 25; //Defaulting it to 25 to make returning the current musicQueue easier
const preventEarrape = true; //Prevents playing videos that have anything similar to "ear rape" in the title ( Yet to be added )

if(typeof isMusicPlaying === 'undefined' || isMusicPlaying === null) isMusicPlaying = new Map(); //Whether or not the bot is playing
if(typeof musicQueue === 'undefined' || musicQueue === null) musicQueue = new Map(); //Streaming musicQueue
if(typeof musicTitleQueue === 'undefined' || musicTitleQueue === null) musicTitleQueue = new Map();
if(typeof activeMusicConnection === 'undefined' || activeMusicConnection === null) activeMusicConnection = new Map(); //The active connection to the guilds vc
if(typeof activeMusicVC === 'undefined' || activeMusicVC === null) activeMusicVC = new Map(); //The active vc object
if(typeof isMusicPaused === 'undefined' || isMusicPaused === null) isMusicPaused = new Map(); //Switch toggle for pausing / unpausing playback

const streamOptions = {seek: 0, volume: 1.1};
module.exports.run = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	//Start with checking if the author is connected to a VC
	if(!message.member.voiceChannel)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, you must be in a Voice Channel to use this command.**");

	//Then check if the author sent some sort of input after the 'play' command
	if(!args[0])
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, please enter a valid video URL.**");

	//Check if the url is a real YT link
	let validate = await ytdl.validateURL(args[0]);
	if(!validate)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, please enter a valid video URL.**");

	//Grab the VC the user is in, join it, then play the video
	let voiceChannel = message.member.voiceChannel;
	activeMusicVC.set(message.guild.id, voiceChannel);
	if(isMusicPlaying.get(message.guild.id) == undefined || !isMusicPlaying.get(message.guild.id) )
	{
		isMusicPlaying.set(message.guild.id, true);
		musicQueue.set(message.guild.id, [args[0]]);

	 voiceChannel.join()
	 .then(async connection =>
	 {
	 	activeMusicConnection.set(message.guild.id, connection);

	     let vidInfo = await ytdl.getInfo(args[0]);
	     const stream = await ytdl.downloadFromInfo(vidInfo, { filter : 'audioonly' });
	     const dispatcher = await connection.playStream(stream, streamOptions);

		 musicTitleQueue.set(message.guild.id, [vidInfo.title]);
	     message.channel.send("<:yt_logo:563701458017583115> **__Now playing:__ `" + vidInfo.title + "`**");
	     dispatcher.on("end", end =>
	     {
	     	nextQueue(client, message, voiceChannel, connection);
	     });
	 })
	 .catch(err =>
	 {
	 	message.channel.send(message.author + "**, An error occurred when trying to join the Voice Channel, or during playback.**");
	 	debug(err);
	 	voiceChannel.leave();
	 });
	}
	else
		addQueue(message, voiceChannel, args[0]);
}

//GameMakers: Studio
async function addQueue(message, voiceChannel, url)
{
	//Check if the url is a real YT link
	let qValidate = await ytdl.validateURL(url);
	if(!qValidate)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, please enter a valid video URL.**");

	//Queue length limiter
	if(musicQueue.length >= musicQueueLimit)
		return message.channel.send(`<:warning_emote:559030535540834324> ${message.author}, the queue is currently full. You can only add **${musicQueueLimit} videos** to the queue.`);

	//Valid URL, let's add it to the musicQueue
	qInfo = await ytdl.getInfo(url);

	musicQueue.get(message.guild.id).push(url);
	musicTitleQueue.get(message.guild.id).push(qInfo.title);

	// musicQueue[musicQueue.length] = url;
	// musicTitleQueue[musicTitleQueue.length] = qInfo.title;

	//Random debug text crap
	//debug(musicQueue.length);
	debug(url);
	message.channel.send("**" + message.author + ", added to queue: `" + qInfo.title + "`**");
}

function nextQueue(client, message, voiceChannel, connection)
{
	if(musicQueue.get(message.guild.id) == null || musicQueue.get(message.guild.id).length <= 1)
	{
		isMusicPlaying.set(message.guild.id, false);
		emptyQueue(message);

		voiceChannel.leave();
		message.channel.send("**I've left the Voice Channel as the queue is empty.**");
	}
	else
	{
		musicQueue.get(message.guild.id).shift();
		musicTitleQueue.get(message.guild.id).shift();
		play(client, message, voiceChannel, connection);
	}
}

async function play(client, message, voiceChannel, connection)
{
	try
	{
		debug(musicQueue.get(message.guild.id).length);

        let playVidInfo = await ytdl.getInfo(musicQueue.get(message.guild.id)[0]);
        const playStream = await ytdl.downloadFromInfo(playVidInfo, { filter : 'audioonly' });
        const playDispatcher = await connection.playStream(playStream, streamOptions);

        message.channel.send("<:yt_logo:563701458017583115> **__Now playing:__ `" + playVidInfo.title + "`**");
        playDispatcher.on("end", end =>
        {
        	nextQueue(client, message, voiceChannel, connection);
        });
    }
    catch(e)
    {
    	message.channel.send(message.author + "**, An error occurred when trying to join the Voice Channel, or during playback.**");
    	client.emit("error", e);
    	voiceChannel.leave();

    	emptyQueue(message);
    }
}

function emptyQueue(message)
{
	musicQueue.set(message.guild.id, null);
	musicTitleQueue.set(message.guild.id, null);
}

function debug(msg, isError)
{
	if(typeof isError === 'undefined') isError = false;

	if(debugText && !isError)
		return console.log(`***MUSIC DEBUG LOG***\n${msg}\n************`);

	return console.error( `***MUSIC DEBUG LOG***\n${msg}\n************`);
}

module.exports.skip = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(!isMusicPlaying.get(message.guild.id))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", There is currently nothing being played.");

	if(!message.member.voiceChannel)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, you must be in a Voice Channel to use this command.**");

	try
	{
		streamingVoiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
		streamingDispatcher = streamingVoiceConnection.player.dispatcher;
		streamingDispatcher.end();
	}
	catch(err)
	{
    	message.channel.send(message.author + "**, An error occurred when trying to join the Voice Channel, or during playback.**");
    	debug(err, true);
	}
}

module.exports.leave = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(!isMusicPlaying.get(message.guild.id))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", There is currently nothing being played.");

	if(!message.member.voiceChannel)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, you must be in a Voice Channel to use this command.**");


	emptyQueue(message);
	isMusicPlaying.set(message.guild.id, false);
	activeMusicVC.get(message.guild.id).leave();

	message.channel.send(message.author + "**, I have left the Voice Channel.**");
}

module.exports.pause = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{ //.pause(); & .resume();
	if(!isMusicPlaying.get(message.guild.id))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", There is currently nothing being played.");

	if(!message.member.voiceChannel)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + "**, you must be in a Voice Channel to use this command.**");

	try
	{
		streamingVoiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
		streamingDispatcher = streamingVoiceConnection.player.dispatcher;
		if(isMusicPaused.get(message.guild.id))
		{
			isMusicPaused.set(message.guild.id, false);
			await streamingDispatcher.resume();
			message.channel.send(`${message.author}, has unpaused the player.`);
		}
		else
		{
			isMusicPaused.set(message.guild.id, true);
			await streamingDispatcher.pause();
			message.channel.send(`${message.author}, has paused the player.`);
		}
	}
	catch(err)
	{
    	message.channel.send(message.author + "**, An error occurred when trying to pause / unpause playback.**");
    	debug(err, true);
	}
}

module.exports.musicQueue = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(!isMusicPlaying.get(message.guild.id))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", There is currently nothing being played, and nothing in the queue at this moment.");

	message.channel.startTyping();

	const musicQueueEmbed = new Discord.RichEmbed()
    	.setColor("#2489be")
		.setAuthor("That One Music Bot", client.user.displayAvatarURL)
		.setTitle("Current Music Queue")
		.setFooter(`Queue length: ${musicQueue.get(message.guild.id).length}`)
		.setTimestamp();

	for(_ql = 0; _ql < musicQueue.get(message.guild.id).length; _ql++)
	{
		if(_ql == 0)
			musicQueueEmbed.addField(`Now Playing.) ${musicTitleQueue.get(message.guild.id)[_ql]}`, musicQueue.get(message.guild.id)[_ql], true);
		else
			musicQueueEmbed.addField(`${_ql + 1}.) ${musicTitleQueue.get(message.guild.id)[_ql]}`, musicQueue.get(message.guild.id)[_ql], true);
	}

	message.channel.send({embed:musicQueueEmbed});
	message.channel.stopTyping();
}

module.exports.remove = async(guild, client, message, args, guildPrefix, guildDate_dir, confi) =>
{
	if(!isMusicPlaying.get(message.guild.id))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", There is currently nothing being played, and nothing in the queue at this moment.");

	if(isNaN(args[0]))
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", Please enter a number corresponding to the queue item you would like to remove.");

	if(args[0] < 0 || args[0] > musicQueue.length - 1)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + `, Please enter a number between **0 and ${musicQueue.length}** corresponding to the queue item you would like to remove.`);

	if(args[0] == 0)
		return message.channel.send("<:warning_emote:559030535540834324> " + message.author + ", You cannot remove a live track from the queue. If you would like to skip, please use the **`skip`** command");

	message.channel.startTyping();

	index = (args[0] * 1) - 1;

	message.channel.send(`${message.author}, has removed: ` + "`" + musicTitleQueue.get(message.guild.id)[index] + "` from the queue.");
	musicQueue.get(message.guild.id).splice(index, 1);
	musicTitleQueue.get(message.guild.id).splice(index, 1);

	message.channel.stopTying();
}
