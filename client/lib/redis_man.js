"use strict";
const apiService = require("./api_service");

const RedisStore = require("ioredis");
const RedisRetryStrategy = require("./RedisRetryStrategy");

let redisPool = {};

//const OAM = require("oam");
const DEFAULT_KEY = "default";
module.exports = {
  init: (props) => {
    if (!props) {
      props = {
        key: DEFAULT_KEY,
        config: {
          host: "127.0.0.1",
          port: 6379,
          db: 0
        },
        oid: "Unknown"
      };
    }
    if (!props.key) {
      props.key = DEFAULT_KEY;
    }
    redisPool[props.key] = {
      config: props.config,
      oid: props.oid,
      redis: null, // initial value, when no connection is yet attempted.
      status: 0 // status of connection.
    };
    global.logger.warn("Register redisprop(" + props.key + ") " + JSON.stringify(redisPool[props.key]));
  },

  getConnection: (key) => {
    if (!key) {
      key = DEFAULT_KEY;
    }
    return new Promise((resolve, reject) => {
      const conn = redisPool[key];
      if (conn && conn.redis != null && conn.status == 1) {
        resolve(conn.redis);
      } else {
        conn.config.retry_strategy = RedisRetryStrategy();
        conn.redis = new RedisStore(conn.config);
        conn.redis.setMaxListeners(100);
        conn.redis.on("ready", () => {
          //OAM.emit("clearAlert", conn.oid);
          if (conn.status !== 1) subscribe(conn.redis);
          conn.status = 1;
          return resolve(conn.redis);
        });

        conn.redis.on("error", (e) => {
          global.logger.error("error", e);
          e.config = conn.config;
          //OAM.emit("criticalAlert", conn.oid);
          return reject(e);
        });
      }
    });
  },

  health: () => {
    let report = {};
    Object.keys(redisPool).forEach((key) => {
      report[key] = redisPool[key].status == 1 ? "OK" : "KO";
    });
    return report;
  }
};

function subscribe(conn) {
  conn &&
    conn.subscribe("mount_file", () => {
      global.logger.info("WB: Subscribed to an event:mount_file");
    });
  conn &&
    conn.on("message", (channel, data) => {
      try {
        global.logger.error("WB: Channel:", channel, ", message:", data);
        if (typeof data == "string") {
          try {
            data = JSON.parse(data);
          } catch (error) {
            data = { code: channel, message: data };
          }
        }
        switch (data.code) {
          case "mount_file":
            apiService.downloadFile(data.message);
            break;
        }
      } catch (error) {
        global.logger.error("Failed to process message", error);
      }
    });
}
