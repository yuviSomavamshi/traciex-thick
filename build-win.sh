npm i -g pkg
mkdir -p build;
cd client;
npm i;
pkg .
\mv -f breathalyzer.exe ../build;
