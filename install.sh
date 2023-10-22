#!/bin/bash

OS="$1"
if [[ "$OS" == "darwin" ]]; then
  brew install conan
fi

conan install . -if build --build missing
cmake -S . -B ./build
cmake --build ./build
