#include <iostream>
#include "transports/https.hpp"
#include <memory>

int main(int argc,char** argv){
  std::unique_ptr<netlang::transports::https::lib> lib = netlang::transports::https::make();
  lib->stream_method_to(netlang::transports::https::NETLANG_HTTPS_GET,"https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods","methods.html");
  return 0;
}
