// Parses user messages and extracts the commands and command arguments

const genericCommandRegex = /\.(\w+)+\s*(.*)/i;

class Parser {
    constructor() {

    }

    // parser.getCommand(msg); outputs a string of the command

    getCommandArgs(msg) {
        // Execute the regex statement on the message text
        let results = genericCommandRegex.exec(msg);

        if (!results) return null;

        // Check that we detected a command
        if (results.length > 0) {
            return {
                command: results[1],
                args: results[2] || '',
            }
        } else {
            return null;
        }
    }
}

export default new Parser();


//const iamRegex = /\.(iam|iama|add|am|is)+\s(.+)/i
//const iamnotRegex = /\.(iamnot|iaint|imnot|remove|iaintno|imno|inot|amnot)+\s(.+)/i
//const whoisRegex = /(\.whois)+\s(.+)/i
//const pingRegex = /(\.ping)+\s*/gi
//const pongRegex = /(\.pong)+\s*/gi
//const sayRegex = /\.(say)+\s(.+)/i;
//const everyoneRegex = /\.(everyone)/i;
