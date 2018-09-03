// Main entry file

const Discord = require('discord.js'); // Import Libraries
const auth = require('./auth.json');

import parser from './utils/ParseMessage' // Import parser
import { logger } from './src/utils' // Import logger
import { rolex } from './bot' // RoleX main logic

// Create Discord Client
const client = new Discord.Client();

// Called when the bot starts up.
client.on('ready', () => {
    logger.info(`Logged in as ${ client.user.tag }`); // output name of of the bot to the console
	//client.user.setUsername("RoleX"); // Set the bot username on startup
});

// Called when new users join server (guild)
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'welcomes');

	// Do nothing if the channel wasn't found on this server
    if (!channel) return;

    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}!\nCheck out <#430981000907194370> and don't forget to <#430970251174215690> to us. :smile:\nAlso you can type \`.help\` for a list of commands you can use.`);
});

// Called whenever a user posts a message
client.on('message', (msg) => {

    // Check if the message was from a bot
    if (msg.author.bot) return;

    /* Can filter chat here */

    if (!msg.content.startsWith('.')) return;

    // Setup Bot with current Message
    rolex.setMessage(msg);

    // Get the text of the message
    let message = msg.content;
    let cmd = parser.getCommandArgs(message);

    // Record the command in the log, else return early since we don't need to do anything
    if (cmd) {
        if (cmd.args)
            logger.info(`#${msg.channel.name} | ${ rolex.getName() }: ${ cmd.command } - ${ cmd.args ? cmd.args : '' }`);
        else
            logger.info(`#${msg.channel.name} | ${ rolex.getName() }: ${ cmd.command }`);
    } else {
        return;
    }

    // Sanitize the input
    let command = cmd.command.replace(/[|&;$%@"<>(),]/g, '');
    let args = cmd.args.replace(/[|&;$%@"<>(),]/g, '');

    // React to different commands
    switch (command) {
        case 'shout':
            rolex.say(args);
            break;

        default:
            try {
                if (args)
                    rolex[command](args);
                else
                    rolex[command]();
            } catch (e) {
                logger.warn(`Invalid Command: ${command}`);
                logger.error(e.message);
            }
            break;
    }
});

client.login(auth.token); // Attempt to Login to Discord
