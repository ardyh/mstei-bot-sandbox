const line = require('@line/bot-sdk');
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { response } = require('express');

dotenv.config();
const PORT=process.env.PORT;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.CHANNEL_SECRET;

const config = {
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET
};

const app = express();

// app.use(express.static('public'));

app.get('/', () => {
  console.log("Hello world!");
})

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(error => console.log("middleware error:", error));
});

const client = new line.Client(config);
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const parsedResponse = await parseCommand(event);

  return client.replyMessage(event.replyToken, parsedResponse)
};

const shalatCommand = "sholat";
async function parseCommand(event) {
  if(event.message.text.includes(shalatCommand)) {
    const cityKeyword = event.message.text.replace(shalatCommand, '').trim();
    return (await handleShalatCommand(cityKeyword));
  }
  return createTextResponse(event.message.text);
}

const createFlexResponse = (flexContent, context) => {
  return {
    type: 'flex',
    altText: context,
    contents: flexContent
  }
} 

const createTextResponse = (textContent) => {
  return {
    type: 'text',
    text: textContent
  }
}

async function handleShalatCommand(cityKeyword) {
  const shalatResponse = await fetchShalatData(cityKeyword);
  
  if(shalatResponse.status === okStatus) {
    return createFlexResponse(
      createSholatTimesContainer(shalatResponse, cityKeyword),
      "Jadwal Sholat"
    );
  }
  return createTextResponse(shalatResponse.message)
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

const  errorStatus = "error";
const okStatus = "ok";
async function fetchShalatData(cityKeyword) {
    
  const shalatResponse = await fetch(`https://api.banghasan.com/sholat/format/json/kota/nama/${cityKeyword}`)
    .then(response => {return response.json()})
    .then(result => {
      if(result.status === okStatus){
        // if there is more than one city found, return the first one
        const fetchedCityCode = result.kota[0].id;
        const currDate = (new Date()).yyyymmdd();
        
        return fetch(`https://api.banghasan.com/sholat/format/json/jadwal/kota/${fetchedCityCode}/tanggal/${currDate}`)
      }
      throw new Error("city fetch error");
    })
    .then(response => {return response.json()})
    .then(result => {
      if(result.status === okStatus) {
        return result
      }
      throw new Error("jadwal fetch error");
    })
    .catch(error => {
      return {
        status: errorStatus,
        message: error.message
      }
    });
    
  return shalatResponse;
}

const createSholatTimesContainer = (fetchResult, cityKeyword) => {
  const selectedSholatTimeNames = [
    "subuh",
    "dzuhur",
    "ashar",
    "maghrib",
    "isya"
  ];

  let containerJSON = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Jadwal Sholat",
              align: "start",
              size: "xl",
              color: "#ffffff"
            }
          ]
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${cityKeyword}`,
              size: "md",
              color: "#ffffff",
              weight: "bold"
            }
          ]
        }
      ],
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
  }

  const sholatTimeItems = [];
  selectedSholatTimeNames.forEach(sholatTime => {
    sholatTimeItems.push(jadwalSholatItem(
      sholatTime,
      fetchResult.jadwal.data[sholatTime]
    ))
  });
  containerJSON["body"]["contents"] = sholatTimeItems;
  
  return containerJSON;
}

const jadwalSholatItem = (sholatName, sholatTime) => {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `${sholatName}`,
            align: "start",
            size: "md"
          }
        ],
        flex: 1,
        paddingTop: "3px"
      },
      {
        type: "box",
        layout: "vertical", 
        contents: [
          {
            type: "text",
            text: `${sholatTime}`,
            align: "start",
            size: "lg",
            weight: "bold"
          }
        ],
        flex: 2,
        paddingStart: "10px"
      }
    ],
    height: "40px"
  };
}



app.listen(PORT, () => {
  let date = new Date().toString();
  console.log(`Deployed on ${date}`);
  console.log(`Listening on port: ${PORT}`);
});

