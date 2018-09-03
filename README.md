# RoleX Bot

![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=for-the-badge) 

RoleX Bot is (at this point) a fairly simple discord bot built in Node.js that allows users to easily view all available roles and add/remove roles from themselves. In it's current state, this bot is something entirely eductional for myself to learn more and try different things - which is why I put it on NPM. At this point I don't really expect *anyone* to use this bot besides myself, but hey, you can if you want.

### Setup


  - Install normally through NPM.
  - Add a file called auth.json with your OAuth2 token form the Discord API.
  - `npm run bot`


### Improve Life

Use PM2 to improve managing the role when left unattended. PM2 will auto restart the script it somehow dies. This also allows us to use the `.restart` in order to quickly restart the bot without much extra work.

### Tech

Node and NPM are a good start. The Discord Node client library should automatically install, but honestly, just seems like something somehow will go wrong. Anyways, I'm done ranting here, just wanted to slightly make it better. 


------------ 

Xander Luciano
