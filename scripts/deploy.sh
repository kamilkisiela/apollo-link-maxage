#!/bin/sh -e

echo '[Deploy] Start deploying'

echo '[Deploy] Compiling new files'
npm run build

echo '[Deploy] Copying LICENSE'
cp ./LICENSE ./dist/

echo '[Deploy] Copying README'
cp ./README.md ./dist/

echo '[Deploy] Deploying to npm...'
npm publish dist --tag latest && git push --tags
echo '[Deploy] Completed'