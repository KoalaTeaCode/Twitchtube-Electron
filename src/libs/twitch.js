var tmi = require("tmi.js");
let eventbus = require('./eventbus');
import remote from 'electron'
import {parse} from 'url'

const TWITCH_USERNAME = process.env.TWITCH_USERNAME;
const TWITCH_PASSWORD = process.env.TWITCH_PASSWORD;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const TWITCH_REDIRECT_URL = process.env.TWITCH_REDIRECT_URL;

var TwitchApi = require('twitch-api');
var twitch = new TwitchApi({
  clientId: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  redirectUri: TWITCH_REDIRECT_URL,
  scopes: ['channel_read'],
});
let twitchUser = {};
let channel = '';

let options = {
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
    channels: []
};

function setUpClient () {
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

  eventbus.on('outgoing-twitch-message', (message) => {
    client.say(channel, message);
  });
}

function setChannel () {
  twitch.getAuthenticatedUserChannel(twitchUser.access_token, (err, channelResponse) => {
    channel = channelResponse.display_name;
    options.channels.push(channel);
    setUpClient();
  });
}

export function twitchSignIn () {
  return new Promise((resolve, reject) => {
    signInWithPopup()
      .then(code => {
        twitch.getAccessToken(code, (err, body) => {
          if (err){
            reject(err);
          } else {
            twitchUser = body;
            setChannel();
            resolve(body)
          }
        });
      })
  });
}

export function signInWithPopup () {
  return new Promise((resolve, reject) => {
    const authWindow = new remote.BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    })

    const authUrl = twitch.getAuthorizationUrl();

    function handleNavigation (url) {
      const query = parse(url, true).query
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`))
        } else if (query.code) {
          // Login is complete
          authWindow.removeAllListeners('closed')
          setImmediate(() => authWindow.close())

          // This is the authorization code we need to request tokens
          resolve(query.code)
        }
      }
    }

    authWindow.on('closed', () => {
      // TODO: Handle this smoothly
      throw new Error('Auth window was closed by user')
    })

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url)
    })

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleNavigation(newUrl)
    })

    authWindow.loadURL(authUrl)
  })
}
