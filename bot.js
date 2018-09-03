// All the "Actions" the bot can take

import Discord from 'discord.js'
const winston = require('winston');

// Create Logger
const logger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({ colorize: true })
    ]
});

// Blacklisted roles that user's can't arbitrarily add to themselves
const blacklistedRoles = [
    'Rot13',
    'user++',
    'Arbiter of Fate',
    'Our Lord, Jabril',
    'Zapier',
    '@everyone',
    'The Naughty Corner (Misbehaving).',
    'Trash',
    'Contributor',
];

class RoleXBot {
    constructor () {

    }

    // Internal User Commands
    // User's can arbitrarily call these. Need to be moved into a state manager.

    // Stores message state
    setMessage(msg) {
        this.msg = msg;
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
        //return (this.msg.member.roles.exists('name', 'Rot13') ? true : false);
        return this.checkForRole('Rot13');
    }

    // Check if user has a role
    checkForRole(role) {
        return (this.msg.member.roles.exists('name', role) ? true : false);
    }

    // Get all "basic" roles
    getAllRoles() {
        let roles = this.msg.guild.roles.filterArray( (role) => {
            let name = role.name;
            if (!blacklistedRoles.includes(name))
                return name;
        });

        roles.sort();

        let payload = roles.join('      ');

        payload += '\n\nAdd a role with \'`.iam ROLENAME`\'';

        //logger.info(roles);

        if (roles.length > 0) {
			let embed = new Discord.RichEmbed({
				"title": `All Available Roles`,
				"description": payload,
                "color": 0xFFEB3B,

                footer: {
                    //icon_url: client.user.avatarURL,
                    text: "RoleX Bot © Xander 2018",
                },

			});
			logger.info(`Displayed All ${ roles.length } Roles.`);
			this.msg.channel.send({embed});
			return;
		}
    }

    // Find a user role by name or ID
    findRole(role) {
        let roleObj = null

        // Look for role by name first
        roleObj = this.msg.guild.roles.find('name', role);

        if (roleObj) {
            logger.warn(`Found Role by Name: ${roleObj.name}`);
            return roleObj;
        }

        // If role is not found by name, try getting the role by ID
        roleObj = this.msg.guild.roles.get(role);

        if (roleObj) {
            logger.info(`Found Role by ID: ${roleObj.name}`);
            return roleObj;
        }

        // Unable to find a matching Role
        logger.error(`${role} is not a valid role.`);
        this.msg.channel.send(`No valid role found :cry:`);
        return null;
    }

    // ------------------------------- //
    // External User Command Functions //
    // ------------------------------- //

	smokeDaWeeds() {
		this.msg.reply('#420 blaze it, yo.');
	}

    // ping pong - it's what you 'd expect.
    ping() {
        this.msg.reply('pong!');
    }

    // Reset all roles (doesn't work cuz it works too well)
    reset() {
        // First get all user roles
        return;

        this.msg.member.edit({
            roles: [],
        });
    }

    add(role) {
        this.iam(role);
    }

    // Add a role
    iam(role) {
        // Check that a Role was supplied by the user
        if (!role) {
            this.msg.react('🤷');
            this.whoami();
            return;
        }

        // Check if this is a blacklisted role...
        if (blacklistedRoles.includes(role)) {
            logger.warn(`${role} is a protected role!`);
            this.msg.reply(`How dumb do I look :neutral_face:`)
            .then()
            .catch();

            this.msg.react('🖕')
            .then()
            .catch();

            return;
        } else {
            // Check if role exists
            let roleObj = this.msg.guild.roles.find('name', role);

            // Reply sarcastically if invalid, else give thumbs up.
            if (!roleObj) {
                logger.error(`${ role } is an invalid role`);
                this.msg.reply(`\`${ role }\` doesn't seem to be an actual role, dumbass :neutral_face:\nDo you need to see the list again? (hint: it's \`.roles\`)`);
                return;
            } else {
                logger.info(`Adding ${ role } to ${ this.getName() }`);
                this.msg.member.addRole(roleObj);
                this.msg.react('✅')
                .then()
                .catch();
                return;
            }
        }
    }

    remove(role) {
        this.iamnot(role);
    }

    // Remove a role
    iamnot(role) {
        // Check that a Role was supplied by the user
        if (!role) {
            this.msg.react('🤷');
            return;
        }

        // Try to find a matching role
        let roleObj = this.findRole(role);

        // No matching Role
        if (!roleObj) return;
        role = roleObj;

        // Log result
        logger.info(`Removing ${ role } on ${ this.getName() }`);
        this.msg.member.removeRole(role);
        this.msg.react('❌')
        .then()
        .catch();
        return;
    }

    // Not Helpful
    help() {
        this.msg.reply('Fo Guck Yourself');
    }

    // Talk as the bot
    say(message) {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        this.msg.channel.send(message);
        this.deleteMessage();
    }

    // Display Role List
    roles() {
        this.getAllRoles();
    }

    // Display User Roles
    whoami() {
        //let roles = this.msg.member.roles.map( role => role.name );
        let roles = this.msg.member.roles.filterArray( role => role.name !== '@everyone' );
        roles.sort();

        logger.info (`${ this.getName() }'s Roles: ${roles}`);

        let embed = new Discord.RichEmbed({
			'title': `${ this.getName() }'s roles`,
			'description': roles.join('\n'),
			'color': 0x2196f3
        });
        this.msg.channel.send({embed});
    }

    // Displays Users in Role
    whois(role) {

        // Try to find a matching role
        let roleObj = this.findRole(role);

        // No matching Role
        if (!roleObj) return;

        role = roleObj.name;

        logger.info(`(whois) Finding users in role: ${role}`);

        // Find all users with role by role name
        let usersInRole = this.msg.guild.members.filter(member => {
            return member.roles.find("name", role);
        }).map(member => {
            return member.user.username;
        });

        let payload = usersInRole.join("\n");

		// Don't display more than 64 users (list would be huge in chat)
        if (usersInRole.length > 64) {
            logger.info(`Too many users (${usersInRole.length}, max: 64)`);
			this.msg.channel.send(`Sorry, too many users to display (${usersInRole.length} users).`);
            return;
        }

		// Check if we have users in this Role
		if (usersInRole.length > 0) {
			let embed = new Discord.RichEmbed({
				"title": `${usersInRole.length} User${usersInRole.length > 1 ? 's are' : ' is'} in ${role.replace(/[|&;$%@"<>(),]/g, '')}`,
				"description": payload,
				"color": roleObj.color,
			});
			//logger.info(usersInRole.join(", "));
			this.msg.channel.send({embed});
			return;
		}

		if (usersInRole.length === 0) {
			logger.error(`No users found in role ${role}`);
			this.msg.channel.send(`Sorry, there are no users in ${role.replace(/[|&;$%@"<>(),]/g, '')}.`);
			return;
		}

        if (!usersusersInRole) {
			logger.error('Error getting users');
			this.msg.channel.send(`Sorry, could not find users in ${role.replace(/[|&;$%@"<>(),]/g, '')}.`);
			return;
		}

		logger.error('Error unhandled exception in: whoami');
		this.msg.channel.send(`Sorry, I ran into an enexpected error. @Xander - Pls fix.`);
        return;
    }

    // Display User Count
    everyone() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        let role = "@everyone";
        let users = this.msg.guild.members.filter(member => {
            return member.roles.find("name", role);
        }).map(member => {
            return member.user.username;
        }).length;

        logger.info(`Server User Count: ${users}`);
        this.msg.channel.send(`Server User Count: ${users}`);
        this.msg.delete();
    }

    // Restart the Script
    restart() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        // Delete the user command and log the restart
        this.deleteMessage();
        logger.warn('Restarting in 500ms!');

        // Restart in 500ms we can delete the message
        setTimeout(() => { process.exit() }, 1000);
    }

    reboot() {
        this.restart();
    }

    reload() {
        this.restart();
    }

    // Kick a user for any reason
    kick() {
        // Only let admins run command
        if (!this.checkIfAdmin()) {
            logger.error(`${ this.getName() } is not an admin!`);
            return;
        }

        let justinbieber = this.msg.mentions.members.first();
        if (justinbieber) {
            justinbieber.kick().then( (justinbieber) => {
                this.msg.channel.send(`Peace out ${justinbieber.displayName}.`)
            }).catch(() => {
                this.message.channel.send('Failed to kick Justin Bieber.');
            });
        }
        logger.warn(`${justinbieber.displayName} was kicked!`);
    }
}

export default new RoleXBot();
