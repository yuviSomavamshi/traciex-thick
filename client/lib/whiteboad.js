const EventEmitter = require("events");
const redis_man = require("./redis_man");
const API_KEY = require("./api_key");
const WB = "whiteboard";
const WBPUBLISH = "WBPUBLISH";
const WBSUBSCRIBE = "WBSUBSCRIBE";

class Whiteboard extends EventEmitter {
  async init(opts) {
    redis_man.init({
      key: WBSUBSCRIBE,
      config: opts,
      oid: WB
    });

    redis_man.init({
      key: WBPUBLISH,
      config: opts,
      oid: WB
    });
    this.opts = opts;
    let connection = await redis_man.getConnection(WBSUBSCRIBE);
    connection.on("message", (channel, data) => {
      console.error("WB: Channel:", channel, ", message:", data);
      if (typeof data == "string") {
        try {
          data = JSON.parse(data);
        } catch (error) {
          data = { code: channel, message: data }
        }
      }
      switch(data.code){
        case "mount_file":
downloadFile(data.message);
        break;
      }
    });
    connection = await redis_man.getConnection(WBPUBLISH);
  }

  async publish(event, message) {
    let data = { code: event, message: message };
    let connection = await redis_man.getConnection(WBPUBLISH);
    connection.publish(event, JSON.stringify(data));
    console.info("WB: Published message to an event:%s", event);
  }

   subscribe(event) {

    return new Promise(async (resolve, reject)=>{
      try {
        let connection = await redis_man.getConnection(WBSUBSCRIBE);
        connection.subscribe(event, () => {
          console.info("WB: Subscribed to an event:%s", event);
          resolve();
        });
      } catch (e) {
        console.error("Failed to subscriber to an Event:", event, e);
        reject(e);
      }
    });
    
  }

}

module.exports = new Whiteboard();

const request = require("request");
const https = require("https");
const keepAliveAgent = new https.Agent({
  rejectUnauthorized: false,
  maxSockets: 40,
  keepAlive: true,
  maxFreeSockets: 20
});


function downloadFile(payload) {
  return new Promise((resolve) => {
    const options = {
      url: "https://traciex.healthx.global/api/v1/raman/download",
      method: "POST",
      json: {filename: payload.file},
      timeout: 5000,
      strictSSL: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(payload).length,
        Accept: "application/json",
        "Accept-Charset": "utf-8",
        "x-api-key": API_KEY.getKey()
      },
//      agent: keepAliveAgent,
//      time: true
    };
    console.log(options);
    request(options, function (err, response, body) {
      console.log(err);
      resolve({ statusCode: response.statusCode, body });
    });
  });
}