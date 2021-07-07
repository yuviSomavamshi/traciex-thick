const request = require("request");
const https = require("https");
const path = require("path");
const fs = require("fs");
const API_KEY = require("./api_key");

const keepAliveAgent = new https.Agent({
  rejectUnauthorized: false,
  maxSockets: 40,
  keepAlive: true,
  maxFreeSockets: 20
});

function downloadFile(payload) {
  return new Promise((resolve) => {
    try {
      let body = { filename: payload.file };
      request(
        {
          url: "https://traciex.healthx.global/api/v1/raman/download",
          method: "POST",
          json: body,
          timeout: 10000,
          strictSSL: false,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": JSON.stringify(body).length,
            Accept: "application/json",
            "Accept-Charset": "utf-8",
            "x-api-key": API_KEY.getKey()
          },
          agent: keepAliveAgent,
          time: true
        },
        function (err, response, body) {
          if (response.statusCode == 200) {
            let filename = path.join(global.raman, payload.file);
            fs.writeFileSync(filename, body);
          }
          resolve({ statusCode: response.statusCode, body });
        }
      );
    } catch (e) {
      console.error(e);
    }
  });
}

module.exports = {
  downloadFile
};
