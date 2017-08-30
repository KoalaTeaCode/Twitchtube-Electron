import {parse} from 'url'
import remote from 'electron'
import axios from 'axios'
import qs from 'qs'
import eventbus from './eventbus'
import moment from 'moment';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_CLIENT_ID = '236227181472-kjsleiv4efcbp7faucu0km6vmrod72pg.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = 'http://localhost';
const YOUR_CLIENT_SECRET = 'v-k9T64uixO2MnMJ5n4WYwp0';

var google = require('googleapis');
var youtube = google.youtube('v3');
var OAuth2 = google.auth.OAuth2;
var GoogleApiWrapper = require('./google-api-wrapper');

var oauth2Client = new OAuth2(
  GOOGLE_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

let lastTimeChecked = moment();
let nextPageToken = '';

export async function googleSignIn () {
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


  GoogleApiWrapper.listLiveBroadcasts(GoogleApiWrapper.oauth2Client)
    .then(finishLoadingGoogle);

}

function finishLoadingGoogle (profile) {
  const liveChatId = profile.items[0].snippet.liveChatId;

  GoogleApiWrapper.insertLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, 'Hello');

  eventbus.on('scream', (message) => {
    console.log(messsage);
    // @TODO: Get google profile ID or id from youtube and ensure we don't send coming from Twitch
    // GoogleApiWrapper.insertLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, message);
  });

  // @TODO: we need to throttle after promises and useing the recommendation in the response
  setInterval(() => {
    console.log("getting mores", nextPageToken)
    let params = {};
    if (nextPageToken) params.pageToken = nextPageToken;

    GoogleApiWrapper.listLiveChat(GoogleApiWrapper.oauth2Client, liveChatId, params)
      .then(parseLiveChatMessages)
  }, 1000);
}

function parseLiveChatMessages (response) {
  nextPageToken = response.nextPageToken;
  lastTimeChecked = moment();

  response.items.forEach(item => {
    let dateOfItem = moment(item.snippet.publishedAt);
    if (lastTimeChecked.isAfter(dateOfItem)) {
      // console.log(item)
      // console.log(item.snippet)
      eventbus.emit('new-youtube-message', message);
    }
  });
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
