const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const apiService = require("./lib/api_service");
const redis_man = require("./lib/redis_man");
module.exports = function () {
  global.logger.debug("running a task every 10 second ");
  redis_man.getConnection().then(async (conn) => await conn.ping());

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
        global.logger.error("error while read file ", err);
      }
    });
};

function processFile(location, name, date) {
  let currFilePath = path.join(location, name);
  fs.createReadStream(currFilePath).on("data", (data) => {
    try {
      let payload = JSON.parse(data);
      payload.subject_id = payload.subject_id.replace(/[()]/g, "");
      payload.machine_id = payload.machine_id.replace(/[()]/g, "");
      global.logger.debug("Uploading payload:", JSON.stringify(payload));
      payload.startTime = new Date().getTime();
      apiService.uploadDiagnosis(payload, date, name, currFilePath);
    } catch (error) {
      global.logger.error("Critical error occured, Please Contact Admin ", error);
    }
  });
}
