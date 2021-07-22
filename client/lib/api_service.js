const request = require("request");
const https = require("https");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");

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
          if (!err) {
            if (response.statusCode == 200) {
              let filename = path.join(global.raman, payload.file);
              fs.writeFileSync(filename, body);
            }
            resolve({ statusCode: response.statusCode, body });
          } else {
            global.logger.error(err);
            resolve({ statusCode: err.statusCode });
          }
        }
      );
    } catch (e) {
      global.logger.error(e);
    }
  });
}

function uploadDiagnosis(payload, date, name, currFilePath) {
  return new Promise((resolve) => {
    const options = {
      url: "https://traciex.healthx.global/api/v1/bc/upload-diagnosis-report",
      method: "POST",
      json: payload,
      timeout: 5000,
      strictSSL: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(payload).length,
        Accept: "application/json",
        "Accept-Charset": "utf-8",
        "x-api-key": API_KEY.getKey()
      },
      agent: keepAliveAgent,
      time: true
    };
    request(options, function (err, response, body) {
      if (err) {
        global.logger.error("error occured", err);
        let newPath = path.join(global.unprocessed, name);
        global.logger.debug("Moving file to ", newPath);
        fsExtra.moveSync(currFilePath, newPath, { overwrite: true });
        global.logger.debug("The file has been moved to ", newPath);
      } else {
        global.logger.debug("Received response from BC, StatusCode:", body._status, ",ResponeTime:", new Date().getTime() - payload.startTime + "ms");
        if (body._status == 201) {
          let newPath = path.join(global.destinationPath, date, name);
          fsExtra.moveSync(currFilePath, newPath, { overwrite: true });
        } else {
          let newPath = path.join(global.unprocessed, name);
          global.logger.debug("Moving file to ", newPath);
          fsExtra.moveSync(currFilePath, newPath, { overwrite: true });
          global.logger.debug("The file has been moved to ", newPath);
        }
      }
      resolve({ statusCode: response.statusCode, body });
    });
  });
}

function uploadFile(file) {
  return new Promise((resolve) => {
    try {
      global.logger.info(`Uploading file:${file}`);
      request(
        {
          url: "https://traciex.healthx.global/api/v1/raman/uploadByRaman",
          method: "POST",
          formData: {
            file: [fs.createReadStream(path.resolve(file))]
          },
          timeout: 5000,
          strictSSL: false,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Charset": "utf-8",
            "x-api-key": API_KEY.getKey(),
            "x-client-id": process.env.CLIENT_ID,
            "x-loc": process.env.LOCATION
          },
          agent: keepAliveAgent,
          time: true
        },
        function (err, response, body) {
          global.logger.error(`File upload statuscode:${body}`);
          resolve({ statusCode: response.statusCode, body });
        }
      );
    } catch (e) {
      global.logger.error(e);
    }
  });
}

module.exports = {
  downloadFile,
  uploadDiagnosis,
  uploadFile
};
