var tmi = require("tmi.js");
let eventbus = require('./eventbus');

var options = {
    options: {
        // debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "twitchtubebot",
        password: "oauth:s3bw0vykfgo0jx7hn1wbjr9zv14aqe"
    },
    channels: ["#thehollidayinn"]
};

var client = new tmi.client(options);

// Connect the client to the server..
client.connect();


client.on("message", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    if (self) return;
    console.log(message)
    //Fire the 'scream' event:
    eventbus.emit('scream', message);
    // Handle different message types..
    switch(userstate["message-type"]) {
        case "action":
            // This is an action message..
            break;
        case "chat":
            // This is a chat message..
            break;
        case "whisper":
            // This is a whisper..
            break;
        default:
            // Something else ?
            break;
    }
});
