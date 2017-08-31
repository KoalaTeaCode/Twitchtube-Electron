var tmi = require("tmi.js");
let eventbus = require('./eventbus');
let channel = "#thehollidayinn";

var options = {
    options: {
        // debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "twitchtubebot",
        password: "oauth:s3bw0vykfgo0jx7hn1wbjr9zv14aqe" // @TODO: is this save to package
    },
    channels: [channel]
};

var client = new tmi.client(options);

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

eventbus.on('new-youtube-message', (message) => {
  client.action(channel, message);
});
