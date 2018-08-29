// Main entry file

// Import Stuff
import parser from './utils/ParseMessage'
import rolex from './bot'

// Import Libraries
const Discord = require('discord.js');
const winston = require('winston');
const auth = require('./auth.json');

// Create Logger
const logger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({ colorize: true })
    ]
});

// Create Discord Client
const client = new Discord.Client();

// Called when the bot starts up.
client.on('ready', () => {
    logger.info(`Logged in as ${ client.user.tag }`); // output name of of the bot to the console
	// Set the bot username on startup
	//client.user.setUsername("RoleX");
});

// Called when new users join server (guild)
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'main');
    
	// Do nothing if the channel wasn't found on this server
    if (!channel) return;
	
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}!\nCheck out <#430981000907194370> and don't forget to <#430970251174215690> to us. :smile:\nAlso you can type \`.help\` for a list of commands you can use.`);
});

// Called whenever a user posts a message
client.on('message', (msg) => {

    // Check if the message was from a bot
    if (msg.author.bot) return;
	
	if (msg.content.toLowerCase().includes('oneless') || msg.content.toLowerCase().includes('🍖 less')
			|| msg.content.toLowerCase().includes('onless') || msg.content.toLowerCase().includes('bone')
			|| msg.content.toLowerCase().includes('gggg') || msg.content.toLowerCase().includes('bone')
			|| msg.content.toLowerCase().includes('e|ess') || msg.content.toLowerCase().includes('🇧')
			|| msg.content.toLowerCase().includes('o n e l') || msg.content.toLowerCase().includes('🅱')) {
				
		logger.info(`${msg.author.username} said boneless.`);
		msg.delete();
		
	}

    if (!msg.content.startsWith('.')) return;

    // Setup Bot with current Message
    rolex.setMessage(msg);

    // Get the text of the message
    let message = msg.content;
    let cmd = parser.getCommandArgs(message);

    // Record the command in the log, else return early since we don't need to do anything
    if (cmd) {
        if (cmd.args)
            logger.info(`(${msg.channel.name})${ rolex.getName() }: ${ cmd.command } - ${ cmd.args ? cmd.args : '' }`);
        else
            logger.info(`(${msg.channel.name})${ rolex.getName() }: ${ cmd.command }`);
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
    return;
});

// Login to Discord
client.login(auth.token);
