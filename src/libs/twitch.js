var tmi = require("tmi.js");
let eventbus = require('./eventbus');
let channel = "#thehollidayinn"; // @TODO: Should be inserted on front end by user

const TWITCH_USERNAME = process.env.TWITCH_USERNAME;
const TWITCH_PASSWORD = process.env.TWITCH_PASSWORD;

const options = {
    options: {
        // debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: TWITCH_USERNAME,
        password: TWITCH_PASSWORD,
    },
    channels: [channel]
};

const client = new tmi.client(options);

// Connect the client to the server..
client.connect();

client.on("message", function (channel, userstate, message, self) {
    if (self) return;

    // Handle different message types..
    switch(userstate["message-type"]) {
        case "action":
            // This is an action message..
            break;
        case "chat":
            // This is a chat message..
            eventbus.emit('new-twitch-message', message);
            break;
        case "whisper":
            // This is a whisper..
            break;
        default:
            // Something else ?
            break;
    }
});

client.on("subscription", function (channel, username, method, message, userstate) {
  client.say(channel, `{username} has subscribed!`);
});

eventbus.on('new-youtube-message', (message) => {
  client.say(channel, message);
});
