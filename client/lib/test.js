const whiteboard= require("./whiteboad");

whiteboard.init({
    host: "52.237.82.94",
    port: 6379,
    db: 0,
    password: "HealthX!Chain123BLR"
});
whiteboard.publish("mount_file", {test:"Hello"});
