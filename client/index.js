const CronJob = require("cron").CronJob;
const path = require("path");
const log4js = require("log4js");
let source, destination, raman;
let defaultPath = process.env.DATA_FOLDER || "C://Data";
const chokidar = require("chokidar");
const redis_man = require("./lib/redis_man");
const mkdirp = require("mkdirp");
const apiService = require("./lib/api_service");

log4js.configure({
  appenders: {
    everything: { type: "dateFile", filename: path.join(defaultPath, "logs", "breathalyzer.log") }
  },
  categories: {
    default: { appenders: ["everything"], level: "debug" }
  }
});
global.logger = log4js.getLogger();
global.logger.info("Version:" + require("./package.json").version);

redis_man.init({
  config: {
    host: "52.237.82.94",
    port: 6379,
    db: 0,
    password: "HealthX!Chain123BLR"
  }
});
redis_man.getConnection().then((con) => {
  con && global.logger.warn("Redis event Subscribed");
});
readInputs().then(() => {
  try {
    if (global.sourcePath == global.destinationPath) {
      global.destinationPath = path.join(global.destinationPath, "processed");
    }
    global.logger.info("Thanks for inputs, You have entered following path");
    global.logger.info(`JSON SEER path ::: ${global.sourcePath}`);
    global.logger.info(`Processed path ::: ${global.destinationPath}`);
    global.logger.info(`Corrupted files/unprocessed :: ${global.unprocessed}`);
  } catch (e) {
    global.logger.error(e);
  }

  try {
    const JobProcessor = require("./jobProcessor");
    const job = new CronJob("*/10 * * * * *", JobProcessor);
    job.start();
  } catch (error) {
    global.logger.error(error);
  }
  const watcher = chokidar.watch(global.raman, { ignored: /^\./, persistent: true });
  watcher
    .on("add", function (file) {
      global.logger.info("File", file, "has been added");
      !file.includes("raman-results") && apiService.uploadFile(file);
    })
    .on("error", function (error) {
      global.logger.error("Error happened", error);
    });

  global.logger.info("Process started...");
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (e) => {
  global.logger.error("Uncaught Expection", e);
});

process.on("unhandledRejection", (reason, p) => {
  global.logger.error("Unhandled Expection", reason, p);
});

function shutdown() {
  global.logger.error("Received kill signal. Initiating shutdown...");
  process.exit(1);
}

function readInputs() {
  return new Promise((resolve) => {
    source = process.env.SETUP_SEER_DIR;
    destination = process.env.SETUP_PROCESSED_DIR;
    global.sourcePath = (source && path.join(source)) || path.resolve(defaultPath);
    global.destinationPath = (destination && path.join(destination)) || path.join(defaultPath, "processed");
    global.unprocessed = path.join(global.destinationPath, "../unprocessed");

    raman = (process.env.SETUP_SEER_RAMAN && path.resolve(process.env.SETUP_SEER_RAMAN)) || path.join(global.sourcePath, "raman");
    global.raman = path.resolve(raman);
    global.logger.info(`Source path      : ${global.sourcePath}`);
    global.logger.info(`Destination path : ${global.destinationPath}`);
    global.logger.info(`Unprocessed path : ${global.unprocessed}`);
    global.logger.info(`Raman CSV path   : ${global.raman}`);
    mkdirp.sync(global.raman);
    mkdirp.sync(global.destinationPath);
    mkdirp.sync(global.sourcePath);
    mkdirp.sync(global.unprocessed);
    resolve();
  });
}
