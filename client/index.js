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
console.log("Version:" + require("./package.json").version);

readInputs().then(() => {
  try {
    if (global.sourcePath == global.destinationPath) {
      global.destinationPath = path.join(global.destinationPath, "processed");
    }
    console.log("Thanks for inputs, You have entered following path");
    console.log(`JSON SEER path ::: ${global.sourcePath}`);
    console.log(`Processed path ::: ${global.destinationPath}`);
    console.log(`Corrupted files/unprocessed :: ${global.unprocessed}`);
  } catch (e) {
    //ignore
  }

  const JobProcessor = require("./jobProcessor");
  const job = new CronJob("*/10 * * * * *", JobProcessor);
  job.start();
  process.stdout.write("Process started...");
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
  console.error("Received kill signal. Initiating shutdown...");
  process.exit(1);
}

function readInputs() {
  return new Promise((resolve) => {
    source = process.env.SETUP_SEER_DIR;
    destination = process.env.SETUP_PROCESSED_DIR;
    raman = process.env.SETUP_SEER_RAMAN;
    global.sourcePath = (source && path.join(source)) || path.resolve(defaultPath);
    global.destinationPath = (destination && path.join(destination)) || path.resolve(defaultPath + "//processed");
    global.unprocessed = path.join(global.destinationPath, "../unprocessed");
    global.raman = path.join(raman, "../raman");
    resolve();
  });
}

const watcher = chokidar.watch(path.resolve(global.raman), { ignored: /^\./, persistent: true });
watcher
  .on("add", function (path) {
    console.log("File", path, "has been added");
  })
  .on("error", function (error) {
    console.error("Error happened", error);
  });
