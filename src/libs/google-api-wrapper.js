var google = require('googleapis');
var plus = google.plus('v1');
let GoogleApiWrapper = {};
let request = require('request-promise');

// Provide the original object for functions that are not wrapped
GoogleApiWrapper.setUpYoutube = function (oauth2Client) {
  var youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  this.youtube = youtube;
  this.oauth2Client = oauth2Client;
};

GoogleApiWrapper.plusGetPeople = function(oauth2Client) {
  const youtube = this.youtube;
  var promise = new Promise(function(resolve, reject) {
    plus.people.get({
      userId: 'me',
      auth: oauth2Client,
    }, function (err, response) {
      if (err) return reject(err);
      return resolve(response);
    });
  });
  return promise;
};


GoogleApiWrapper.listLiveBroadcasts = function(oauth2Client) {
  const youtube = this.youtube;
  var promise = new Promise(function(resolve, reject) {
    youtube.liveBroadcasts.list({
        broadcastType: "persistent",
        part: "snippet,id",
        maxResults: 1,
        mine: true,
        auth: oauth2Client,
      },
      function(err, response) {
        if (err) return reject(err);
        return resolve(response);
    });
  });

  return promise;
};

GoogleApiWrapper.insertLiveChat = function(oauth2Client, liveChatId, message) {
  const youtube = this.youtube;

  var promise = new Promise(function(resolve, reject) {
    let params = {
      part: 'snippet,id,authorDetails',
      auth: oauth2Client,
      resource: {
        snippet: {
          liveChatId,
          type: 'textMessageEvent',
          textMessageDetails: {
            messageText: message,
          },
        },
      },
    };

    let options =  {};

    youtube.liveChatMessages.insert(params, options,
      function(err, response) {
        if (err) return reject(err);
        return resolve(response);
      });
  });

  return promise;
};

GoogleApiWrapper.listLiveChat = function(oauth2Client, liveChatId, paramsInc) {
  const youtube = this.youtube;

  let options = {
    uri: 'https://www.googleapis.com/youtube/v3/liveChat/messages',
    qs: {
      part: 'snippet,id,authorDetails',
      liveChatId,
    },
    headers: {
      'Authorization': `Bearer ${oauth2Client.credentials.access_token}`,
    },
    json: true // Automatically parses the JSON string in the response
  };

  return request(options)
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });

  // var promise = new Promise(function(resolve, reject) {
  //   let params = {
  //     part: 'snippet,id',
  //     liveChatId,
  //     auth: oauth2Client,
  //   };
  //   Object.assign(params, paramsInc);
  //
  //   let options =  {};
  //
  //   youtube.liveChatMessages.list(params, options,
  //     function(err, response) {
  //       if (err) return reject(err);
  //       return resolve(response);
  //     });
  // });

  // return promise;
};

module.exports = GoogleApiWrapper;
