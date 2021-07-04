const CronJob = require("cron").CronJob;
const path = require("path");
const log4js = require("log4js");
let source, destination, raman;
let defaultPath = process.env.DATA_FOLDER || "C://Data";
const chokidar = require("chokidar");

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
    //ignore
    console.error(e);
  }

  const JobProcessor = require("./jobProcessor");
  const job = new CronJob("*/10 * * * * *", JobProcessor);
  job.start();
  global.logger.info(global.raman);
  const watcher = chokidar.watch(global.raman, { ignored: /^\./, persistent: true });
  watcher
    .on("add", function (path) {
      global.logger.info("File", path, "has been added");
    })
    .on("error", function (error) {
      console.error("Error happened", error);
    });

  process.stdout.write("Process started...");
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (e) => {
  console.error("Uncaught Expection", e);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Expection", reason, p);
});

function shutdown() {
  console.error("Received kill signal. Initiating shutdown...");
  process.exit(1);
}

function readInputs() {
  return new Promise((resolve) => {
    source = process.env.SETUP_SEER_DIR;
    destination = process.env.SETUP_PROCESSED_DIR;
    global.sourcePath = (source && path.join(source)) || path.resolve(defaultPath);
    global.destinationPath = (destination && path.join(destination)) || path.resolve(defaultPath + "//processed");
    global.unprocessed = path.join(global.destinationPath, "../unprocessed");

    raman = (process.env.SETUP_SEER_RAMAN && path.resolve(process.env.SETUP_SEER_RAMAN)) || global.sourcePath;
    global.raman = path.join(raman, "../raman");
    resolve();
  });
}
