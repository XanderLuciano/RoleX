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

let role = null;

// Regex Expressions for commands
const iamRegex = /\.(iam|iama|add|am|is)+\s(.+)/i
const iamnotRegex = /\.(iamnot|iaint|imnot|remove|iaintno|imno|inot|amnot)+\s(.+)/i
const whoisRegex = /(\.whois)+\s(.+)/i
const pingRegex = /(\.ping)+\s*/gi
const pongRegex = /(\.pong)+\s*/gi
const sayRegex = /\.(say)+\s(.+)/i;
const everyoneRegex = /\.(everyone)/i;

const whitelistRoles = [
    'composer',
    'artist',
    'business',
    '3d modelling',
    'game programmer',
    'q/a',
    'mobile developer',
    'web developer',
    'voice actor',
    'sound designer',
    'security',
];

// Detects when correctly connected to Discord
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'main');
    
	// Do nothing if the channel wasn't found on this server
    if (!channel) return;
	
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}! Check out <#430981000907194370> and don't forget to <#430970251174215690> to us. :smile:`);
  });

// Detects when a new message is posted in ANY channel
client.on('message', msg => {
    // Only respond to messages that start with .
	if (msg.content[0] !== '.')
        return;
    
	// Don't respond to bots
    if (msg.author.bot)
        return;
    
	// Display all commands
    if (msg.content === '.help') {
		logger.info(`${msg.author.username} request the .help list.`);
		
        let commands = [
            '`.help` - displays all available commands',
            '`.ping` - responds with ``Pong``, if your connection is fine (useful to test for connection issues)',
            '`.whoami` - retrieve all your current roles',
            '`.whois [Role]` - retrieve all users that are assigned to the specified role',
            '`.iam [Role]`  or  `.add [Role]` - set your role',
			'`.iamnot [Role]` or `.remove [Role]` - remove the specified role',
			'`.roles` - Display list of available roles.',
        ];
        
        let embed = new Discord.RichEmbed({
            "title": `Available Commands`,
            "description": commands.join('\n'),
            "color": 0xFFFF
        });
        
        msg.channel.send({embed});
		return;
    }
	
	// Display all roles available at the user level
	// TODO: Auto generate this list
	if (msg.content === '.roles') {
		logger.info(`${msg.author.username} request the role list.`);
		
		let roles = [
			'Composer',
			'Artist',
			'Business',
			'3D Modelling',
			'Game Programmer',
			'Q/A',
			'Mobile Developer',
			'Web Developer',
			'Voice Actor',
			'Sound Designer',
			'Security',
		];
        
        let embed = new Discord.RichEmbed({
            "title": `Available Roles`,
            "description": roles.join('\n'),
            "color": 0xFFFF
        });
        
        msg.channel.send({embed});
		return;
	}
    
	// Easter Egg
    if (msg.content === '.iam .ping .pong') {
        reply(msg, 'BOT ABUSE!! MODS BOT ABUSE!');
        return;
    }
    
	// Easter Egg
    if (msg.content === '.iam .ping' || msg.content === '.iam .pong') {
        reply(msg, 'No you\'re not');
        return;
    }
    
	// Reply to .ping
    if (pingRegex.exec(msg.content)) {
        logger.info(`${msg.author.username}: ${msg.content}`);
        reply(msg, 'pong');
        return;
    }
	
	// Easter Egg - Reply to .pong
    if (pongRegex.exec(msg.content)) {
        logger.info(`${msg.author.username}: ${msg.content}`);
        reply(msg, 'that\'s not how this works.');
        return;
    }
    
	// Respond to .whoami with all roles
    if (msg.content === '.whoami') {
        let roles = msg.member.roles.map(r => r.name);
        
        logger.info(`${msg.author.username}'s: ${roles}`);
        
        let embed = new Discord.RichEmbed({
			"title": `${msg.author.username}'s roles`,
			"description": roles.join("\n"),
			"color": 0xFFFF
        });
        
        msg.channel.send({embed});
        
        return;
    }
    
	// Respond to .whois with all users in a role (max 64)
    let roleToFind = whoisRegex.exec(msg.content);
    if (roleToFind) {
        let role = roleToFind[2];
		
		// Override for @everyone
		if (role === "everyone") {
			role = "@everyone";
		} else {
			role = toTitleCase(role);
		}
		
        console.log(`Find users in: ${role}`);
        
        let usersInRole = msg.guild.members.filter(member => { 
            return member.roles.find("name", role);
        }).map(member => {
            return member.user.username;
        });
        
        let payload = usersInRole.join("\n");
        
		// Don't display more than 64 users (list would be huge in chat)
        if (usersInRole.length > 64) {
            logger.info(`Too many users (${usersInRole.length}, max: 64)`);
			msg.channel.send(`Sorry, too many users to display (${usersInRole.length} users).`);
            return;
        }
        
		// Check if we have users in this Role
		if (usersInRole.length > 0) {		
			let embed = new Discord.RichEmbed({
				"title": `${usersInRole.length} User${usersInRole.length > 1 ? 's are' : ' is'} ${role.replace(/[|&;$%@"<>()+,]/g, '')}`,
				"description": payload,
				"color": 0xFFFF
			});
			logger.info(usersInRole.join(", "));
			msg.channel.send({embed});
			return;
		}
		
		if (usersInRole.length === 0) {
			logger.error(`No users found in role ${role}`);
			msg.channel.send(`Sorry, there are no users in ${role.replace(/[|&;$%@"<>()+,]/g, '')}.`);
			return;
		}
		
        if (!usersusersInRole) {
			logger.error('Error getting users');
			msg.channel.send(`Sorry, could not find users in ${role.replace(/[|&;$%@"<>()+,]/g, '')}.`);
			return;
		}
        
		
		logger.error('Error unhandled exception in: whoami');
		msg.channel.send(`Sorry, I ran into an enexpected error. @Xander - Pls fix.`);
        return;
    }
    
	// Respond to something IF xander said it.
    if (msg.author.id === '250222623923896321') {
	}
	
	// Responds to .say if commanded by admin
	let results = sayRegex.exec(msg.content)
	if(results) {
		// Check if user is admin (Rot13)
		if (msg.member.roles.exists('name', 'Rot13')) {
			logger.info(`(admin)${msg.author.username}: ${results[2]}`);
			msg.channel.send(results[2]);
			msg.delete();
			return;
		} else {
			logger.error(`(pleb)${msg.author.username} tried to say: ${results[2]}`);
			return;
		}
	}
	
	// Responds to .everyone if commanded by admin
	results = everyoneRegex.exec(msg.content)
	if(results) {
		// Check if user is admin (Rot13)
		if (msg.member.roles.exists('name', 'Rot13')) {
			let role = "@everyone";
			let users = msg.guild.members.filter(member => { 
				return member.roles.find("name", role);
			}).map(member => {
				return member.user.username;
			}).length;
			
			console.log(`Server User Count: ${users}`);
			msg.channel.send(`Server User Count: ${users}`);
			msg.delete();
			return;
		} else {
			logger.error(`(pleb)${msg.author.username} tried to get user count`);
			return;
		}
	}
	
	if (msg.content === '.restart' || msg.content === '.reboot') {
		if (msg.member.roles.exists('name', 'Rot13')) {
			msg.channel.send(`Rebooting...`);
			console.warn(`${msg.author.username} rebooted the server`);
			msg.delete();
			setTimeout(() => { process.exit() }, 500);
			return;
		} else {
			console.error(`${msg.author.username} tried to reboot the server`);
			return;
		}
	}
    
	// Respond to .iam for adding roles
    results = iamRegex.exec(msg.content);
    if (results) {
        if (results.length != 3)
            return;
        
        if (results[1]) {
            logger.info(`${msg.author.username}: ${results[2]}`);
            
            if (iam(msg, results[2]))
                return;
        }
        logger.error('.iam error');
        return;
    }
    //console.log(results);

    // Respond to .iamnot for removing roles
    results = iamnotRegex.exec(msg.content);
    if (results) {
        if (results.length != 3)
            return;
        
        if (results[1]) {
            logger.info(`${msg.author.username}: ${results[2]}`);

            if (iamnot(msg, results[2]))
                return;
        }
        logger.error('.iamnot error');
        return;
    }
	
    logger.warn(`Unknown Command. ${msg.author.username}: '${msg.content}'`);
});

// Detects deleted messages
client.on('messageDelete', (msg) => {
    // Detect if user deleted .ping message
	if (msg.content === '.ping') {
        reply(msg, 'Why u delete ur message to me? :(');
    }
});

function iam(msg, txtRole) {
    let article = getArticle(txtRole);

    if (txtRole !== 'user++')
        txtRole = toTitleCase(txtRole);
    
    
    logger.info(`${msg.author.username} Requested Role: '${txtRole}'`);
    
    reply(msg, `I understand you claim to be ${article} ${txtRole.replace(/[|&;$%@"<>()+,]/g, '')}.`);
    
    let user = msg.member;
    let role = user.guild.roles.find('name', txtRole);
    
    if (!role) {
        logger.error('Invalid role');
        reply(msg, 'But that doesn\'t seem to be an available role dumbass :neutral_face:');
        return true;
    }
    
    // Currently a blacklist, should a whitelist.
    // Should whitelist based on current rank
    if (txtRole === 'user++' || txtRole === 'Rot13' || txtRole === 'Arbiter of Fate'
    || txtRole == 'Our Lord, Jabril' || txtRole === 'The Naughty Corner (Misbehaving)'
    || txtRole === 'Contributor' || txtRole === 'Zapier' || txtRole === '@everyone') {
        logger.error('Protected role');
        reply(msg, 'How dumb do I look :neutral_face:');
        return true;
    }
    
    // Should be converted into the whitelist
    if (txtRole !== 'user++' && txtRole !== 'Rot13') {
        user.addRole(role);
        reply(msg, `I've added ${txtRole} to your roles! :smile:`);
        return true;
    }
    logger.error('iam error: end of function');
    return false;
}

function iamnot(msg, txtRole) {
    if (txtRole !== 'user++')
        txtRole = toTitleCase(txtRole);

    logger.info(`${msg.author.username} Requested Role Removal: '${txtRole}'`);
    
    let user = msg.member;
    let role = user.guild.roles.find('name', txtRole);

    if (!role) {
        logger.error('Invalid role');
        reply(msg, `${txtRole.replace(/[|&;$%@"<>()+,]/g, '')} doesn\'t seem to be an available role :neutral_face:`);
        return true;
    }

    if (whitelistRoles.includes(txtRole.toLowerCase())) {
        user.removeRole(role);
        reply(msg, `I've removed ${txtRole} from your roles! :smile:\nEven if you didn't have it :upside_down:`);
        return true;
    } else {
        reply(msg, `I'm sorry Dave, I'm afraid I can't do that.\n${txtRole} is not a whitelisted role.`);
        return true;
    }
    logger.error('iamnot error: end of function');
    return false;
}

// Reply and log response message
function reply(msg, text) {
    msg.reply(text);
    logger.info(`RoleX: ${msg.author.username}, ${text}`);
}

// Converts lower case to Title Case.
// Improves the chances a user's supplied role matches a valid role
function toTitleCase(str)
{
	if (str === "Q/A")
		return str;
	
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// Replaced with getArticle
function isVowel(c) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1
}

// rigoneri/indefinite-article.js
// https://github.com/rigoneri/indefinite-article.js
// Used to respond with a or an correctly
function getArticle(phrase) {
	let word;
	
    // Getting the first word 
    let match = /\w+/.exec(phrase);
    if (match)
        word = match[0];
    else
        return "an";
    
    let l_word = word.toLowerCase();
    // Specific start of words that should be preceded by 'an'
    let alt_cases = ["honest", "hour", "hono"];
    for (let i in alt_cases) {
        if (l_word.indexOf(alt_cases[i]) == 0)
            return "an";
    }
    
    // Single letter word which should be preceded by 'an'
    if (l_word.length == 1) {
        if ("aedhilmnorsx".indexOf(l_word) >= 0)
            return "an";
        else
            return "a";
    }
    
    // Capital words which should likely be preceded by 'an'
    if (word.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/)) {
        return "an";
    }
    
    // Special cases where a word that begins with a vowel should be preceded by 'a'
    regexes = [/^e[uw]/, /^onc?e\b/, /^uni([^nmd]|mo)/, /^u[bcfhjkqrst][aeiou]/]
    for (let i in regexes) {
        if (l_word.match(regexes[i]))
            return "a"
    }
    
    // Special capital words (UK, UN)
    if (word.match(/^U[NK][AIEO]/)) {
        return "a";
    }
    else if (word == word.toUpperCase()) {
        if ("aedhilmnorsx".indexOf(l_word[0]) >= 0)
            return "an";
        else 
            return "a";
    }
    
    // Basic method of words that begin with a vowel being preceded by 'an'
    if ("aeiou".indexOf(l_word[0]) >= 0)
        return "an";
    
    // Instances where y follwed by specific letters is preceded by 'an'
    if (l_word.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/))
        return "an";
    
    return "a";
}

// Login to Discord
client.login(auth.token);
