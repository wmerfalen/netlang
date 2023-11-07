#!/bin/bash

# sudo apt -y install libpq5

if [[ ! -d ./libpqxx ]]; then
  git clone 'https://github.com/jtv/libpqxx'
fi
cd libpqxx
if [[ -d ./build ]]; then
  rm -rf ./build
fi

mkdir build
cd build
cmake ..

make -j 4
