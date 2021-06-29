const Discord = require("discord.js");
const config = require("../../config.json");
const sqlHand = require("./sql_handler.js");
let client = undefined;

exports.main = async function(clients, message)
{
    client = clients;
    var achCheckGuild = message.guild;

	var memberAchInfoCheck = await sqlHand.getData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, "data", "id", message.author.id);
	if(memberAchInfoCheck.ac1 != 1)
	{
		if(await achUserCrateGodCheck(message))
		{
			memberAchInfoCheck.ac1 = 1;
			memberAchInfoCheck.totalAch++;

			const gratz = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setDescription("**Congratulations!** You have been awarded the 'Crate God Achievement' for opening more than 1,000 Crates within the " + message.guild.name + " server!");

			message.reply({embed:gratz});
			await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
		}
	}
	if(memberAchInfoCheck.ac2 != 1)
	{
		if(await achUserTotalBGCheck(message))
		{
			memberAchInfoCheck.ac2 = 1;
			memberAchInfoCheck.totalAch++;

			const gratz = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setDescription("**Congratulations!** You have been awarded the 'Collector Achievement' for gaining more than 5+ backgrounds within the " + message.guild.name + " server!");

			message.reply({embed:gratz});
			await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
		}
	}
	if(memberAchInfoCheck.ac4 != 1)
	{
		if(await achUserTotalBalCheck(message))
		{
			memberAchInfoCheck.ac4 = 1;
			memberAchInfoCheck.totalAch++;

			const gratz = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setDescription("**Congratulations!** You have been awarded the 'Millionaire Achievement' for reaching a Lifetime Balance of 1,000,000 within the " + message.guild.name + " server!");

			message.reply({embed:gratz});
			await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
		}
	}
	if(memberAchInfoCheck.ac5 != 1)
	{
		if(await achUserLvlCheck(message))
		{
			memberAchInfoCheck.ac5 = 1;
			memberAchInfoCheck.totalAch++;

			const gratz = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setDescription("**Congratulations!** You have been awarded the 'Newb Achievement' for reaching level 10 within the " + message.guild.name + " server!");

			message.reply({embed:gratz});
			await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
		}
	}
	if(memberAchInfoCheck.ac6 != 1)
	{
		if(await achStaffCheck(message))
		{
			memberAchInfoCheck.ac6 = 1;
			memberAchInfoCheck.totalAch++;

			const gratz = new Discord.RichEmbed()
				.setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
				.setDescription("**Congratulations!** You have been awarded the 'Staff Achievement' for becoming a staff member within the " + message.guild.name + " server!");

			message.reply({embed:gratz});
			await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
		}
	}
    if(memberAchInfoCheck.ac7 != 1)
    {
        if(await achDonorCheck(message))
        {
            let memberProfileInfo = await sqlHand.getData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_profile_data.sqlite`, "data", "id", message.author.id);
            var memberInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);

            memberInfo.bal += 500;
            memberInfo.crates += 2;
            memberInfo.crates2 += 2;

            memberAchInfoCheck.ac7 = 1;
            memberAchInfoCheck.totalAch++;

            memberProfileInfo.bg23 = 1;
            memberProfileInfo.totalBG++;

            attachment = new Discord.Attachment('./resources/prof_bg/bg22.png', 'donor_rewards.png');
            const gratz = new Discord.RichEmbed()
                .setColor("#be243e")
				.setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL)
                .setDescription(`**Congratulations!** You have been awarded the 'Donor Achievement' for donating within the ${message.guild.name} server!\n\nYou have also unlocked an exclusive profile background, 500 Quarters, and 4 crates:`)
                .attachFile(attachment)
                .setImage('attachment://donor_rewards.png');

            message.reply({embed:gratz});
            await sqlHand.setData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, config.usersSQLSetter, memberInfo);
            await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_achievement_data.sqlite`, config.achievementsSQLSetter, memberAchInfoCheck);
            await sqlHand.setData(client, `./SQL/guild_data/${achCheckGuild.id}/members/member_profile_data.sqlite`, config.profileBG_SQLSetter, memberProfileInfo);
		}
    }
}

async function achDonorCheck(message)
{
    //Only want it to work for a single server
    if(message.guild.id == '598718838611247114') return true;
    if(message.guild.id != '545006544790749194') return false;

    let donorRole = await message.guild.roles.find(role => role.id == '592875106821341203');
    let guildUser = await message.guild.members.find(member => member.id == message.author.id);

    if(guildUser.roles.has(donorRole.id)) return true;
}

function achStaffCheck(message)//saffff//
{
	var achUser = message.guild.members.find(member => member.id == message.author.id);
	var staffRoles = ["Owner", "Admin", "admin", "Administrator", "Community Manager", "God", "Mod", "Moderator", "Chat Mod", "Chat Moderator", "Events Host", "Event Host"];

	for(var i = 0; i < staffRoles.length; i++)
	{
		try
		{
			var roleCheck = message.guild.roles.find(role => role.name == staffRoles[i]);
			if(achUser.roles.has(staffRoles[i].id))
				return true;

		} catch(e) { continue; }
	}

	return false;
}

async function achUserLvlCheck(message)
{
	var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	if(memberBgInfo.level >= 10)
		return true;

	return false;
}

async function achUserTotalBalCheck(message)
{
	var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	if(memberBgInfo.totalBal >= 1000000)
		return true;

	return false;
}

async function achUserTotalBGCheck(message)
{
	var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	if(memberBgInfo.totalBG >= 5)
		return true;

	return false;
}

async function achUserCrateGodCheck(message)
{
	var memberBgInfo = await sqlHand.getData(client, `./SQL/guild_data/${message.guild.id}/members/member_data.sqlite`, "data", "id", message.author.id);
	if(memberBgInfo.openedCrates >= 1000)
		return true;

	return false;
}
