sudo apt-get update -y
sudo apt-get dist-upgrade -y
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
tar -zxvf thick-client.tgz;
cd client;
export DATA_FOLDER=`pwd`;
export SETUP_SEER_DIR=/home/pi/data;
export SETUP_PROCESSED_DIR=/home/pi/data/processed;
export SETUP_SEER_RAMAN=/home/pi/data/raman;
export API_KEY='3453454343';
nohup node ./index.js &
