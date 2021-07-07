const fs = require("fs");
const path = require("path");
const fsExtra = require("fs-extra");
const request = require("request");
const mkdirp = require("mkdirp");
const BC = "https://traciex.healthx.global/api/v1/bc/upload-diagnosis-report";
const https = require("https");
const API_KEY = require("./lib/api_key");
const keepAliveAgent = new https.Agent({
  rejectUnauthorized: false,
  maxSockets: 40,
  keepAlive: true,
  maxFreeSockets: 20
});

module.exports = function () {
  global.logger.debug("running a task every 10 second ");

  // Function to get the filenames present
  // in the directory
  const readdir = (dirname) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirname, (error, filenames) => {
        if (error) {
          reject(error);
        } else {
          resolve(filenames);
        }
      });
    });
  };

  //json filter to filter out the json files
  //in the directory
  const filterjsonFiles = (filename) => {
    return filename.split(".")[1] == "json";
  };

  let date = new Date().toISOString().slice(0, 10).split("-").join("") + "//";
  let location = path.join(global.sourcePath, date);
  global.logger.debug("Checking for JSON file in", location);

  readdir(location)
    .then((filenames, err) => {
      if (err) return;
      filenames = filenames.filter(filterjsonFiles);
      for (let i = 0; i < filenames.length; i++) {
        processFile(location, filenames[i], date);
      }
    })
    .catch((err) => {
      if (err.errno == -4058) {
        mkdirp.sync(location);
      } else {
        console.error("error while read file ", err);
      }
    });
};

function sendRequest(payload, date) {
  return new Promise((resolve) => {
    const options = {
      url: BC,
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

function processFile(location, name, date) {
  let currFilePath = path.join(location, name);
  fs.createReadStream(currFilePath).on("data", (data) => {
    try {
      let payload = JSON.parse(data);
      payload.subject_id = payload.subject_id.replace(/[()]/g, "");
      payload.machine_id = payload.machine_id.replace(/[()]/g, "");
      global.logger.debug("Uploading payload:", JSON.stringify(payload));
      payload.startTime = new Date().getTime();
      sendRequest(payload, date);
    } catch (error) {
      global.logger.error("Critical error occured, Please Contact Admin ", error);
    }
  });
}
