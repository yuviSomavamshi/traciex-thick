sudo apt-get update -y
sudo apt-get dist-upgrade -y
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y dos2unix
node -v
tar -zxvf thick-client.tgz;
cd client/scripts;
dos2unix client.sh
chmod 777 client.sh
sh client.sh start
