// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-polyfill");
require('babel-register')({
    presets: [ 'env' ]
});

// Import the rest of our application.
// module.exports = require('./main.js');

const main = require('./main.js');

global.client = main.client;
global.channels = client.channels;

main.start().then( () => {
    console.log('RoleX Started.');
});
