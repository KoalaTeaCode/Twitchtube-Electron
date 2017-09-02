import {parse} from 'url'
import remote from 'electron'
import { ipcMain } from 'electron'
import axios from 'axios'
import qs from 'qs'
import eventbus from './eventbus'
import moment from 'moment';
import config from '../config'

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
let GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
let GOOGLE_REDIRECT_URI = config.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
let GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET

var google = require('googleapis');
var youtube = google.youtube('v3');
var OAuth2 = google.auth.OAuth2;
var GoogleApiWrapper = require('./google-api-wrapper');

let oauth2Client = {};
let displayName = '';
let liveChatId = '';
let lastTimeChecked = moment();
let nextPageToken = '';
let status = 'running';
let startedEverything = false;
let chatTimeout;

export async function googleSignIn () {
  oauth2Client = new OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  const code = await signInWithPopup()

  oauth2Client.getToken(code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      mySignInFunction(oauth2Client)
    }
  });
  return
}

function mySignInFunction (oauth2Client) {
  // oauth2Client.setCredentials({
  //   access_token: providerUser.idToken,
  // });

  GoogleApiWrapper.setUpYoutube(oauth2Client);

  GoogleApiWrapper.plusGetPeople(GoogleApiWrapper.oauth2Client)
    .then(plusProfile => {
      displayName = plusProfile.displayName;

      return GoogleApiWrapper.listLiveBroadcasts(GoogleApiWrapper.oauth2Client)
    })
    .then(finishLoadingGoogle);
}

function finishLoadingGoogle (profile) {
  liveChatId = profile.items[0].snippet.liveChatId;
  // GoogleApiWrapper.insertLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, 'Hello');

  status = 'running';

  if (startedEverything) return;

  ipcMain.on('google-stop', (event, arg) => {
    status = 'stopped';
    event.sender.send('youtube-stopped')
  });

  ipcMain.on('google-check', (event, arg) => {
    event.sender.send('google-check-response', status === 'running')
  });

  eventbus.on('new-twitch-message', (message) => {
    if (status === 'stopped') return;
    if (message.text.indexOf(displayName) !== -1) return; // Doesn't seem like the best way to prevent Google messages from being broughtback
    if (message.username.indexOf('twitchtubebot') !== -1) return; // Doesn't seem like the best way to prevent Google messages from being broughtback
    if (message.text.indexOf('From') !== -1) return; // Doesn't seem like the best way to prevent Google messages from being broughtback

    GoogleApiWrapper.insertLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, `From ${message.username}: ${message.text}`);
  });

  eventbus.on('outgoing-youtube-message', (message) => {
    if (status === 'stopped') return;
    if (message.indexOf(displayName) !== -1) return; // Doesn't seem like the best way to prevent Google messages from being broughtback
    GoogleApiWrapper.insertLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, message);
  });

  getChat();

  startedEverything = true;
}

function getChat () {
  let params = {};
  if (nextPageToken) params.pageToken = nextPageToken;

  GoogleApiWrapper.listLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, params)
    .then(parseLiveChatMessages)
}

function parseLiveChatMessages (response) {
  nextPageToken = response.nextPageToken;

  let chatWasSeen = false;
  response.items.forEach(item => {
    let dateOfItem = moment(item.snippet.publishedAt);
    if (lastTimeChecked.isBefore(dateOfItem)) {
      let messageText = item.snippet.displayMessage;
      chatWasSeen = true;
      if (status !== 'stopped') eventbus.emit('new-youtube-message', messageText);
    }
  });

  if (chatWasSeen) {
    // We only need to update this after we have seen a new message
    lastTimeChecked = moment();
  }

  chatTimeout = setTimeout(() => {
    getChat()
  }, response.pollingIntervalMillis)
}

export function signInWithPopup () {
  return new Promise((resolve, reject) => {
    const authWindow = new remote.BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    })

    // TODO: Generate and validate PKCE code_challenge value
    // const urlParams = {
    //   response_type: 'code',
    //   redirect_uri: GOOGLE_REDIRECT_URI,
    //   client_id: GOOGLE_CLIENT_ID,
    //   scope: 'profile email',
    // }
    // const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me',
      // 'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // If you only need one scope you can pass it as a string
      scope: scopes,

      // Optional property that passes state parameters to redirect URI
      // state: { foo: 'bar' }
    });

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
