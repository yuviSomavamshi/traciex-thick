start=`date +%s`
npm i -g pkg
mkdir -p build;
cd client;
npm i;
npm run prettify
cd ../
sh build-rasp.sh
sh build-win.sh


end=`date +%s`
runtime=$((end-start))
echo "$runtime"
