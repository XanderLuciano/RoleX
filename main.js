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
const iamRegex = /(\.iam)+\s(.+)/gi
const whoisRegex = /(\.whois)+\s(.+)/gi
const pingRegex = /(\.ping)+\s*/gi
const pongRegex = /(\.pong)+\s*/gi

// Detects when correctly connected to Discord
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
        let commands = [
            '.ping - checks if you are lagging or you are having connection issues',
            '.whoami- retrieve all your current roles',
            '.whois [Role] - retrieve all users that are assigned to the specified role',
            '.say [Text] (admin only) - make the bot say something (Rot13 Only)',
            '.iam [Role] - set your role, can be the following (case and space sensitive)',
        ];
        
        let embed = new Discord.RichEmbed({
            "title": `Available Commands`,
            "description": commands.join('\n'),
            "color": 0xFFFF
        });
        
        msg.channel.send({embed});
    }
	
	// Display all roles available at the user level
	// TODO: Auto generate this list
	if (msg.content === '.roles') {
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
        
        logger.info(roles);
        
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
        console.log(role);
        
        let usersInRole = msg.guild.members.filter(member => { 
            return member.roles.find("name", role);
        }).map(member => {
            return member.user.username;
        });
        
        let payload = usersInRole.join("\n");
        
        if (usersInRole.length > 64) {
            msg.channel.send(`Sorry, too many users to display (${usersInRole.length} users).`);
            return;
        }
        
        let embed = new Discord.RichEmbed({
			"title": `${usersInRole.length} Users with Role ${role}`,
			"description": payload,
			"color": 0xFFFF
        });
        
        msg.channel.send({embed});
        
        return;
    }
    
	// Respond to .say IF xander said it.
    if (msg.author.id === '250222623923896321') {
        logger.info(`(admin)Xander: ${msg.content}`);
        
        let regx = /(\.say)+\s(.+)/gi;
        let res = regx.exec(msg.content)
        if(res) {
            logger.info(res[2]);
            msg.channel.send(res[2]);
			msg.delete();
            return;
        }
    }
    
	// Respond to .iam for adding roles
    let results = iamRegex.exec(msg.content);
    
    if (!results)
        return;
    
    if (results.length != 3)
        return;
    
    if (results[1] === '.iam') {
        logger.info(`${msg.author.username}: ${results[2]}`);
        
        let txtRole = results[2];
        if (txtRole !== 'user++') {
            txtRole = toTitleCase(txtRole);
        }
		let article = getArticle(results[2]);
		
		logger.info(`Requested Role: ${txtRole} or ${results[2]}`);
        
        reply(msg, `I understand you claim to be ${article} ${results[2].replace(/[|&;$%@"<>()+,]/g, '')}.`);
        
        let user = msg.member;
        let role = user.guild.roles.find('name', txtRole);
        
        if (!role) {
            logger.error('Invalid role');
            reply(msg, 'But that doesn\'t seem to be an available role dumbass :neutral_face:');
            return;
        }
        
		// Currently a blacklist, should a whitelist.
		// Should whitelist based on current rank
        if (txtRole === 'user++' || txtRole === 'Rot13' || txtRole === 'Arbiter of Fate'
        || txtRole == 'Our Lord, Jabril' || txtRole === 'The Naughty Corner (Misbehaving)'
        || txtRole === 'Contributor' || txtRole === 'Zapier' || txtRole === '@everyone') {
            logger.error('Protected role');
            reply(msg, 'How dumb do I look :neutral_face:');
            return;
        }
        
		// Should be converted into the whitelist
        if (txtRole !== 'user++' && txtRole !== 'Rot13') {
            user.addRole(role);
            reply(msg, `I've added ${txtRole} to your roles! :smile:`);
			return;
        }
		
        return;
    }
});

// Detects deleted messages
client.on('messageDelete', (msg) => {
    // Detect if user deleted .ping message
	if (msg.content === '.ping') {
        reply(msg, 'Why u delete ur message to me? :(');
    }
});

// Reply and log response message
function reply(msg, text) {
    msg.reply(text);
    logger.info(`RoleX: ${msg.author.username}, ${text}`);
}

// Converts lower case to Title Case.
// Improves the chances a user's supplied role matches a valid role
function toTitleCase(str)
{
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
    // Specific start of words that should be preceeded by 'an'
    let alt_cases = ["honest", "hour", "hono"];
    for (let i in alt_cases) {
        if (l_word.indexOf(alt_cases[i]) == 0)
            return "an";
    }
    
    // Single letter word which should be preceeded by 'an'
    if (l_word.length == 1) {
        if ("aedhilmnorsx".indexOf(l_word) >= 0)
            return "an";
        else
            return "a";
    }
    
    // Capital words which should likely be preceeded by 'an'
    if (word.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/)) {
        return "an";
    }
    
    // Special cases where a word that begins with a vowel should be preceeded by 'a'
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
    
    // Basic method of words that begin with a vowel being preceeded by 'an'
    if ("aeiou".indexOf(l_word[0]) >= 0)
        return "an";
    
    // Instances where y follwed by specific letters is preceeded by 'an'
    if (l_word.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/))
        return "an";
    
    return "a";
}

// Login to Discord
client.login(auth.token);
