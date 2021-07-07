const API_KEY_ENV = process.env.API_KEY || "23423432423,3453454343";
const API_KEYS = API_KEY_ENV.split(",");

function getKey(){
    let key = API_KEYS.shift();
    API_KEYS.push(key);
    return key;
}

module.exports = {
    getKey: getKey
};