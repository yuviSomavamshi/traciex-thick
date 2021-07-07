mkdir -p build;
cd client;
npm i;
npm run prettify
cd ../
sh build-rasp.sh
sh build-win.sh