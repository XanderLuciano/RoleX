// All the "Actions" the bot can take

import Discord                      from 'discord.js'      // Discord API library
import { logger, blacklistedRoles } from './src/utils'     // Import helper utilities
import { ADMIN, USER }              from './src/commands'  // Import Commands



class RoleXBot {
    constructor () {
        this.msg    = null;
        this.client = null;
    }

    // Internal User Commands
    // User's can arbitrarily call these.

    // Stores message state
    setMessage(msg) {
        this.msg = msg;
    }

    // Store discord client
    setClient(client) {
        this.client = client;
    }

    // Deletes message
    deleteMessage() {
        this.msg.delete();
    }

    // Names be got
    getName() {
        return this.msg.author.username;
    }

    // Users be got
    getUser() {
        return this.msg.user
    }

    // Check if someone is admin / Rot13
    checkIfAdmin() {
        return this.checkForRole('Rot13') || this.checkForRole('Arbiter of Fate');
    }

    // Check if user has a role
    checkForRole(role) {
        // return !!(this.msg.member.roles.exists('name', role));
        return !!(this.msg.member.roles.some(val => val.name === role));
    }

    // Get all "basic" roles
    async getAllRoles() {
        const roles = this.msg.guild.roles.filter( role => !blacklistedRoles.includes(role.name) ).array().sort();
        let payload = roles.join(', ');

        payload += `\n\nAdd a role with '\`.iam ROLENAME\`'\n\n`;
        payload += `⚠ DO NOT INCLUDE THE @ ⚠\n`;
        payload += `Case sensitive too. Why? Because it is.`;

        if (roles.length > 0) {
			const embed = new Discord.RichEmbed({
				title: `All ${ roles.length } Available Roles`,
				description: payload,
                color: 0xFFEB3B,

                footer: {
                    // icon_url: client.user.avatarURL,
                    text: "RoleX Bot © Xander 2018",
                },
			});
			logger.info(`Displayed All ${ roles.length } Roles.`);
			await this.msg.channel.send({embed});
		}
    }

    // Find a user role by name or ID
    async findRole(role) {
        let roleObj;

        // Look for role by name first
        // roleObj = this.msg.guild.roles.find('name', role);
        roleObj = this.msg.guild.roles.find( val => val.name === role );

        if (roleObj) {
            logger.info(`Found Role by Name: ${roleObj.name}`);
            return roleObj;
        }

        // If role is not found by name, try getting the role by ID
        roleObj = this.msg.guild.roles.get(role);

        if (roleObj) {
            logger.info(`Found Role by ID: ${roleObj.name}`);
            return roleObj;
        }

        // Unable to find a matching Role
        logger.error(`${ role } is not a valid role.`);
        await this.msg.channel.send(`No valid role found :cry:`);
    }


    // ------------------------------- //
    // External User Command Functions //
    // ------------------------------- //


	[USER.SMOKE_WEED]() {
		this.msg.reply('#420 blaze it, yo.');
        setTimeout( () => this.msg.delete(), 3000 );
	}

    // ping pong - it's what you 'd expect.
    [USER.PING]() {
        this.msg.reply('pong!');
    }

    // pong - returns the average bot ping.
    async [USER.PONG]() {
        await this.msg.channel.send(`${ this.client.ping }ms`);
    }

    // Reset all roles (doesn't work cuz it works too well)
    [USER.RESET]() {
        // First get all user roles
        return false;
        // this.msg.member.edit({ roles: [] });
    }

    [USER.ADD_ROLE](role) {
        this.iam(role);
    }

    // Add a role
    async [USER.IAM](role) {
        // Check that a Role was supplied by the user
        if (!role) {
            await this.msg.react('🤷');
            this.whoami();
            return;
        }

        // Check if this is a blacklisted role...
        if (blacklistedRoles.includes(role)) {
            logger.warn(`${role} is a protected role!`);
            await this.msg.reply(`How dumb do I look :neutral_face:`);
            await this.msg.react('🖕');
            await this.msg.react('❌');

        // Check if role exists
        } else {
            // let roleObj = this.msg.guild.roles.find('name', role);
            let roleObj = this.msg.guild.roles.find( val => val.name === role );

            // Reply sarcastically if invalid, else give thumbs up.
            // Auto delete messages after short timeout
            if (!roleObj) {
                logger.error(`${ role } is an invalid role`);
                this.msg.reply(`\`${ role }\` doesn't seem to be an actual role (or you can't type), dumbass :neutral_face:\nDo you need to see the list again? (hint: it's \`.roles\`)`);
                setTimeout( () => this.msg.delete(), 3000 );
            } else {
                logger.info(`Adding ${ role } to ${ this.getName() }`);
                await this.msg.member.addRole(roleObj);
                await this.msg.react('✅');
                setTimeout( () => { this.msg.delete(); }, 5000 );
            }
        }
    }

    [USER.REMOVE](role) {
        this.iamnot(role);
    }

    // Remove a role
    async [USER.IAMNOT](role) {
        // Check that a Role was supplied by the user
        if (!role) {
            await this.msg.react('🤷');
            await this.msg.react('❌');
            return;
        }

        // Try to find a matching role
        let roleObj = await this.findRole(role);

        // No matching Role
        if (!roleObj) return;
        role = roleObj;

        // Log result
        logger.info(`Removing ${ role } on ${ this.getName() }`);
        await this.msg.member.removeRole( role );
        await this.msg.react('✅');
    }

    // Not Helpful
    async [USER.HELP]() {
        this.msg.reply('Fo Guck Yourself\nYou can help RoleX: https://github.com/XanderLuciano/RoleX\nevery star helps feed a starving bot.');
        await this.msg.react('⭐');
    }

    // Display Role List
    async [USER.ROLES]() {
        await this.getAllRoles();
    }

    // Display User Roles
    async [USER.WHOAMI]() {
        //let roles = this.msg.member.roles.map( role => role.name );
        const roles = this.msg.member.roles.filter( role => role.name !== '@everyone' ).array().sort().join('\n');

        // logger.info (`${ this.getName() }'s Roles: ${ JSON.stringify(roles) }`);
        logger.info (`List ${ this.getName() }'s Roles.`);

        let embed = new Discord.RichEmbed({
			'title': `${ this.getName() }'s roles`,
			'description': roles,
			'color': 0x2196f3,
            footer: {
                // icon_url: client.user.avatarURL,
                text: "RoleX Bot © Xander 2018",
            },
        });
        await this.msg.channel.send({embed});
        setTimeout( () => this.msg.delete(), 3000 );
    }

    // Displays Users in Role
    async [USER.WHOIS](role) {

        // Try to find a matching role
        let roleObj = await this.findRole(role);

        // No matching Role
        if (!roleObj) return;

        role = roleObj.name;

        logger.info(`(whois) Finding users in role: ${ role }`);

        // Find all users with role by role name
        let usersInRole = this.msg.guild.members
            // .filter( member => !!member.roles.find("name", role) )
            .filter( member => !!member.roles.find( val => val.name === role) )
                .map( member => member.user.username );

        let payload = usersInRole.join("\n");

		// Don't display more than 64 users (list would be huge in chat)
        if (usersInRole.length > 64) {
            logger.info(`Too many users (${ usersInRole.length }, max: 64)`);
			await this.msg.channel.send(`Sorry, too many users to display (${ usersInRole.length } users).`);
            return;
        }

		// Check if we have users in this Role
		if (usersInRole.length > 0) {
			let embed = new Discord.RichEmbed({
				"title": `${usersInRole.length} User${usersInRole.length > 1 ? 's are' : ' is'} in ${ role.replace(/[|&;$%@"<>(),]/g, '') }`,
				"description": payload,
				"color": roleObj.color,
			});

			await this.msg.channel.send({embed});
			return;
		}

		if (usersInRole.length === 0) {
			logger.error(`No users found in role ${role}`);
			await this.msg.channel.send(`Sorry, there are no users in ${ role.replace(/[|&;$%@"<>(),]/g, '') }.`);
			return;
		}

        if (!usersInRole) {
			logger.error('Error getting users');
			await this.msg.channel.send(`Sorry, could not find users in ${ role.replace(/[|&;$%@"<>(),]/g, '') }.`);
			return;
		}

		logger.error('Error unhandled exception in: whoami');
		await this.msg.channel.send(`Sorry, I ran into an enexpected error. @Xander - Pls fix.`);
    }

    async [USER.UPTIME]() {
        const uptime     = this.client.uptime;
        let milliseconds = parseInt( uptime % 1000 ).toString(),
            seconds      = parseInt( (uptime / 1000) % 60 ).toString(),
            minutes      = parseInt( (uptime / (1000 * 60) ) % 60 ).toString(),
            hours        = parseInt(  uptime / (1000 * 60 * 60) ).toString();
        const uptimeString = `${ hours.padStart(2, '0') }:${ minutes.padStart(2, '0') }:${ seconds.padStart(2, '0') }.${ milliseconds.padStart(3, '0') }`;
        logger.info(`Bot uptime: ${uptimeString}`);
        await this.msg.channel.send(`Current uptime: ${uptimeString}`);
        setTimeout( () => this.msg.delete(), 3000);
    }


    // --------------------------------- //
    //  Admin  Only  Command  Functions  //
    // --------------------------------- //


    // Talk as the bot
    async [ADMIN.SAY](message) {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        await this.msg.channel.send(message);
        this.msg.delete();
    }

    // Display User Count
    async [ADMIN.EVERYONE]() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        /*
        // This just returns all online users
        let role = "@everyone";
        let users = this.msg.guild.members.filter(member => {
            return member.roles.find("name", role);
        }).map(member => {
            return member.user.username;
        }).length;
        */

        const onlineUsers = this.msg.guild.members.filter( member => !member.user.bot ).size;
        const botUsers    = this.msg.guild.members.filter( member =>  member.user.bot ).size;
        const totalUsers  = this.msg.guild.memberCount;

        logger.info(`Server User Count: ${ onlineUsers } / ${ totalUsers }`);
        await this.msg.channel.send(`Members: **${ onlineUsers }** (online) / **${ botUsers }** (bots) / **${ totalUsers }** (total)`);
        this.msg.delete();

    }

    // Restart the Script
    [ADMIN.RESTART]() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        // Delete the user command and log the restart
        this.deleteMessage();
        logger.warn('Restarting in 1 second!');

        // Restart in 1 second we can delete the message
        setTimeout( () => { process.exit() }, 1000 );
    }

    [ADMIN.REBOOT]() { this.restart() }
    [ADMIN.RELOAD]() { this.restart() }

    // Kick a user for any reason
    async [ADMIN.KICK]() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        const justinbieber = this.msg.mentions.members.first();
        if (justinbieber) {
            try {
                const _justinBieber = await justinbieber.kick();
                await this.msg.channel.send(`Peace out ${ _justinBieber.displayName }.`);
            } catch (e) {
                await this.msg.channel.send(`Failed to kick Justin Bieber.\n${ e.toString() }`);
                logger.error(e);
                return;
            }
        }
        logger.warn(`${ justinbieber.displayName } was kicked!`);
    }

    async [ADMIN.BULK_DELETE](countStr) {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        const deleteCount = parseInt(countStr, 10);
        if (!deleteCount) {
            logger.error('Failed to detect number');
        }

        try {
            // Restrict between 1 and 1000 messages
            const count = Math.min( Math.max(deleteCount, 0), 999 );
            const amountPerIteration = 50;
            if (count > amountPerIteration) {
                let remaining = count;
                while (remaining > 0) {
                    if (remaining < amountPerIteration) {
                        await this.msg.channel.bulkDelete(remaining, false);
                        logger.info(`Deleted ${ remaining } messages.`);
                        remaining -= remaining;
                    } else {
                        await this.msg.channel.bulkDelete(amountPerIteration, false);
                        logger.info(`Deleted ${ amountPerIteration } messages.`);
                        remaining -= amountPerIteration;
                    }
                }
                logger.info(`${ this.getName() } deleted ${ deleteCount } message(s) in ${ this.msg.channel.name }.`);
            } else {
                await this.msg.channel.bulkDelete(count + 1, false);
                logger.info(`${ this.getName() } deleted ${ deleteCount } message(s) in ${ this.msg.channel.name }.`);
            }
        } catch (e) {
            logger.error(`Failed to delete all messages! ${e.message}`);
            await this.msg.reply(`Error! - Could not delete all messages.\n${e.message}`);
            await this.msg.delete();
        }
    }
}

export const rolex = new RoleXBot();
