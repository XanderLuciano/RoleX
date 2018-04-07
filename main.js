const Discord = require('discord.js');
const winston = require('winston');
const auth = require('./auth.json');

const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({ colorize: true })
  ]
});

const client = new Discord.Client();

let role = null;

const iamRegex = /(\.iam)+\s(.+)/gi
const pingRegex = /(\.ping)+\s*/gi
const pongRegex = /(\.pong)+\s*/gi
const whoisRegex = /(\.whois)+\s(.+)/gi

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content[0] !== '.')
		return;
	
	if (msg.content === '.help') {
		let commands = [
			'.ping',
			'.whoami',
			'.whois [Role]',
			'.say [Text] (admin only)',
			'.iam [Role]',
		];
		
		let embed = new Discord.RichEmbed({
			"title": `Available Commands`,
			"description": commands.join('\n'),
			"color": 0xFFFF
		});
		
		msg.channel.send({embed});
	}
	
	if (msg.content === '.iam .ping .pong') {
		reply(msg, 'BOT ABUSE!! MODS BOT ABUSE!');
		return;
	}
	
	if (msg.content === '.iam .ping' || msg.content === '.iam .pong') {
		reply(msg, 'No you\'re not');
		return;
	}
	
	if (pingRegex.exec(msg.content)) {
		logger.info(`${msg.author.username}: ${msg.content}`);
		reply(msg, 'pong');
		return;
	}
	if (pongRegex.exec(msg.content)) {
		logger.info(`${msg.author.username}: ${msg.content}`);
		reply(msg, 'that\'s not how this works.');
		return;
	}
	
	if (msg.author.bot) {
		return;
	}
	
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
		
		if (usersInRole > 64) {
			msg.channel.send('Sorry, too many users to display.');
			return;
		}
		
		let embed = new Discord.RichEmbed({
        "title": `Users with Role`,
        "description": payload,
        "color": 0xFFFF
		});
		
		msg.channel.send({embed});
		
		return;
	}
	
	if (msg.author.id === '250222623923896321') {
		logger.info('Message from the Boss');
		//msg.channel.send('I see u xander');
		
		let regx = /(\.say)+\s(.+)/gi;
		let res = regx.exec(msg.content)
		if(res) {
			logger.info(res[2]);
			msg.channel.send(res[2]);
			return;
		} else {
			return;
		}
	}
	
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
		
		let article = getArticle(results[2].split(' ')[0]);
		reply(msg, `I understand you claim to be ${article} ${results[2].replace(/[|&;$%@"<>()+,]/g, '')}.`);
		
		let user = msg.member;
		let role = user.guild.roles.find('name', txtRole);
		
		if (!role) {
			logger.error('Invalid role');
			reply(msg, 'But that doesn\'t seem to be an available role dumbass :neutral_face:');
			return;
		}
		
		if (txtRole === 'user++' || txtRole === 'Rot13' || txtRole === 'Arbiter of Fate'
		|| txtRole == 'Our Lord, Jabril' || txtRole === 'The Naughty Corner (Misbehaving)'
		|| txtRole === 'Contributor' || txtRole === 'Zapier' || txtRole === '@everyone') {
			logger.error('Protected role');
			reply(msg, 'How dumb do I look :neutral_face:');
			return;
		}
		
		if (txtRole !== 'user++' && txtRole !== 'Rot13') {
			user.addRole(role);
			reply(msg, `I've added ${txtRole} to your roles! :smile:`);
		}
		return;
	}
});

client.on('messageDelete', (msg) => {
	if (msg.content === 'ping') {
		reply(msg, 'Why u delete ur message to me? :(');
	}
});

function reply(msg, text) {
	msg.reply(text);
	logger.info(`RoleX: ${msg.author.username}, ${text}`);
}

function isVowel(c) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getArticle(phrase) {
        
    // Getting the first word 
    var match = /\w+/.exec(phrase);
    if (match)
        var word = match[0];
    else
        return "an";
    
    var l_word = word.toLowerCase();
    // Specific start of words that should be preceeded by 'an'
    var alt_cases = ["honest", "hour", "hono"];
    for (var i in alt_cases) {
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
    for (var i in regexes) {
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

client.login(auth.token);
