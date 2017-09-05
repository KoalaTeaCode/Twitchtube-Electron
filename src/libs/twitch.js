var tmi = require("tmi.js");
let eventbus = require('./eventbus');
import { ipcMain } from 'electron'
import remote from 'electron'
import {parse} from 'url'
import config from '../config'
const notify = require('electron-main-notification')

const TWITCH_USERNAME = config.TWITCH_USERNAME || process.env.TWITCH_USERNAME;
const TWITCH_PASSWORD = config.TWITCH_PASSWORD || process.env.TWITCH_PASSWORD;

const TWITCH_CLIENT_ID = config.TWITCH_CLIENT_ID || process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = config.TWITCH_SECRET || process.env.TWITCH_SECRET;
const TWITCH_REDIRECT_URL = config.TWITCH_REDIRECT_URL || process.env.TWITCH_REDIRECT_URL;

var TwitchApi = require('twitch-api');
var twitch = new TwitchApi({
  clientId: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  redirectUri: TWITCH_REDIRECT_URL,
  scopes: ['channel_read'],
});
let twitchUser = {};
let channel = '';
let status = 'running';
let everythingLoaded = false;

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
    if (status === 'stopped') return;
    if (self) return;

    // Handle different message types..
    switch(userstate["message-type"]) {
      case "action":
        // This is an action message..
        break;
      case "chat":
        // This is a chat message..
        eventbus.emit('new-twitch-message', {
          text: message,
          username: userstate['display-name'],
        });
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
    if (status === 'stopped') return;
    client.say(channel, `{username} has subscribed!`);
  });

  ipcMain.on('twitch-check', (event, arg) => {
    event.sender.send('twitch-check-response', status === 'running')
  });

  eventbus.on('new-youtube-message', (message) => {
    if (status === 'stopped') return;

    // @TODO: This should be checking for the youtube name right?
    //if (message.text.indexOf('From') !== -1) return; // Doesn't seem like the best way to prevent

    client.say(channel, `From ${message.author}: ${message.text}`);
  });

  eventbus.on('outgoing-twitch-message', (message) => {
    if (status === 'stopped') return;
    client.say(channel, message);
  });

  ipcMain.on('twitch-stop', (event, arg) => {
    status = 'stopped';
    event.sender.send('twitch-stopped')
  });

  everythingLoaded = true;
}

function setChannel () {
  status = 'running';
  if (everythingLoaded) return;

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
          notify('Error!', { body: `There was an error: ${query.error}` })
          setImmediate(() => authWindow.close())
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
      // throw new Error('Auth window was closed by user')
      reject();
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
