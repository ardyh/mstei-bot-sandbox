"use strict";

var line = require('@line/bot-sdk');

var express = require('express');

var dotenv = require('dotenv');

var fetch = require('node-fetch');

var _require = require('express'),
    response = _require.response; // const fs = require('fs');
// const readline = require('readline');
// const {google} = require('googleapis');


dotenv.config();
var PORT = process.env.PORT;
var CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
var CHANNEL_SECRET = process.env.CHANNEL_SECRET;
var config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET
};
var app = express(); // app.use(express.static('public'));

app.get('/', function () {
  console.log("Hello world!");
});
app.post('/webhook', line.middleware(config), function (req, res) {
  Promise.all(req.body.events.map(handleEvent)).then(function (result) {
    return res.json(result);
  })["catch"](function (error) {
    return console.log("middleware error:", error);
  });
});
var client = new line.Client(config);

function handleEvent(event) {
  var parsedResponse;
  return regeneratorRuntime.async(function handleEvent$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(event.type !== 'message' || event.message.type !== 'text')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", Promise.resolve(null));

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(parseCommand(event));

        case 4:
          parsedResponse = _context.sent;
          return _context.abrupt("return", client.replyMessage(event.replyToken, parsedResponse));

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}

;
var shalatCommand = "sholat";

function parseCommand(event) {
  var cityKeyword;
  return regeneratorRuntime.async(function parseCommand$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!event.message.text.includes(shalatCommand)) {
            _context2.next = 5;
            break;
          }

          cityKeyword = event.message.text.replace(shalatCommand, '').trim();
          _context2.next = 4;
          return regeneratorRuntime.awrap(handleShalatCommand(cityKeyword));

        case 4:
          return _context2.abrupt("return", _context2.sent);

        case 5:
          return _context2.abrupt("return", createTextResponse(event.message.text));

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
}

var createFlexResponse = function createFlexResponse(flexContent, context) {
  return {
    type: 'flex',
    altText: context,
    contents: flexContent
  };
};

var createTextResponse = function createTextResponse(textContent) {
  return {
    type: 'text',
    text: textContent
  };
};

function handleShalatCommand(cityKeyword) {
  var shalatResponse;
  return regeneratorRuntime.async(function handleShalatCommand$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(fetchShalatData(cityKeyword));

        case 2:
          shalatResponse = _context3.sent;

          if (!(shalatResponse.status === okStatus)) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", createFlexResponse(createSholatTimesContainer(shalatResponse, cityKeyword), "Jadwal Sholat"));

        case 5:
          return _context3.abrupt("return", createTextResponse(shalatResponse.message));

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
}

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based

  var dd = this.getDate();
  return [this.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
};

var errorStatus = "error";
var okStatus = "ok";

function fetchShalatData(cityKeyword) {
  var shalatResponse;
  return regeneratorRuntime.async(function fetchShalatData$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(fetch("https://api.banghasan.com/sholat/format/json/kota/nama/".concat(cityKeyword)).then(function (response) {
            return response.json();
          }).then(function (result) {
            if (result.status === okStatus) {
              // if there is more than one city found, return the first one
              var fetchedCityCode = result.kota[0].id;
              var currDate = new Date().yyyymmdd();
              return fetch("https://api.banghasan.com/sholat/format/json/jadwal/kota/".concat(fetchedCityCode, "/tanggal/").concat(currDate));
            }

            throw new Error("city fetch error");
          }).then(function (response) {
            return response.json();
          }).then(function (result) {
            if (result.status === okStatus) {
              return result;
            }

            throw new Error("jadwal fetch error");
          })["catch"](function (error) {
            return {
              status: errorStatus,
              message: error.message
            };
          }));

        case 2:
          shalatResponse = _context4.sent;
          return _context4.abrupt("return", shalatResponse);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
}

var createSholatTimesContainer = function createSholatTimesContainer(fetchResult, cityKeyword) {
  var selectedSholatTimeNames = ["subuh", "dzuhur", "ashar", "maghrib", "isya"]; // let containerJSON = {
  //   type: "bubble",
  //   header: {
  //     type: "box",
  //     layout: "vertical",
  //     contents: [
  //       {
  //         type: "text",
  //         text: `Jadwal Sholat ${cityKeyword}`
  //       }
  //     ]
  //   },
  //   body: {
  //     type: "box",
  //     layout: "vertical",
  //     contents: []
  //   },
  //   styles: {
  //     header: {
  //       backgroundColor: "#ffaaaa"
  //     },
  //     body: {
  //       backgroundColor: "#aaffaa"
  //     }
  //   }
  // };

  var containerJSON = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [{
        type: "box",
        layout: "vertical",
        contents: [{
          type: "text",
          text: "Jadwal Sholat",
          align: "start",
          size: "xl",
          color: "#ffffff"
        }]
      }, {
        type: "box",
        layout: "vertical",
        contents: [{
          type: "text",
          text: "".concat(cityKeyword),
          size: "md",
          color: "#ffffff",
          weight: "bold"
        }]
      }],
      height: "90px",
      margin: "md",
      spacing: "none"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: []
    },
    styles: {
      header: {
        backgroundColor: "#00b900"
      }
    }
  };
  var sholatTimeItems = [];
  selectedSholatTimeNames.forEach(function (sholatTime) {
    sholatTimeItems.push(jadwalSholatItem(sholatTime, fetchResult.jadwal.data[sholatTime]));
  });
  containerJSON["body"]["contents"] = sholatTimeItems;
  return containerJSON;
};

var jadwalSholatItem = function jadwalSholatItem(sholatName, sholatTime) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [{
      type: "box",
      layout: "vertical",
      contents: [{
        type: "text",
        text: "".concat(sholatName),
        align: "start",
        size: "md"
      }],
      flex: 1,
      paddingTop: "3px"
    }, {
      type: "box",
      layout: "vertical",
      contents: [{
        type: "text",
        text: "".concat(sholatTime),
        align: "start",
        size: "lg",
        weight: "bold"
      }],
      flex: 2,
      paddingStart: "10px"
    }],
    height: "40px"
  };
};

app.listen(PORT, function () {
  var date = new Date().toString();
  console.log("Deployed on ".concat(date));
  console.log("Listening on port: ".concat(PORT));
}); // /// GOOGLE DRIVE SDK
// // If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = 'token.json';
// // Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Drive API.
//   authorize(JSON.parse(content), listFiles);
// });
// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//   const {client_secret, client_id, redirect_uris} = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[0]);
//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }
// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback for the authorized client.
//  */
// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }
// /**
//  * Lists the names and IDs of up to 10 files.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// function listFiles(auth) {
//   const drive = google.drive({version: 'v3', auth});
//   drive.files.list({
//     q: "mimeType='image/jpeg' or mimeType='image/png'",
//     pageSize: 10,
//     fields: 'nextPageToken, files(id, name)',
//     spaces: 'drive'
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const files = res.data.files;
//     if (files.length) {
//       console.log('Files:');
//       files.map((file) => {
//         console.log(`${file.name} (${file.id})`);
//       });
//     } else {
//       console.log('No files found.');
//     }
//   });
// }
// ///GOOGLE DRIVE SDK END