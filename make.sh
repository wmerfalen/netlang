#!/bin/bash
if [[ ! -d ./bin/transports ]]; then
  mkdir ./bin/transports
fi
tsc
cp ./dist/main.js ./bin/netlang
cp ./dist/transports/*.js* ./bin/transports/
cp ./dist/*.js* ./src/
cp ./dist/*.js* ./bin/
