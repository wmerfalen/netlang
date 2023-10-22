#ifndef __NETLANG_TRANSPORTS_HTTPS_HEADER__
#define __NETLANG_TRANSPORTS_HTTPS_HEADER__

#include <iostream>
#include <memory>

namespace netlang {
  namespace transports {
    namespace https {
      enum method_t : uint8_t {
        NETLANG_HTTPS_GET = 0,
        NETLANG_HTTPS_POST,
        NETLANG_HTTPS_PUT,
        NETLANG_HTTPS_DELETE,
        NETLANG_HTTPS_OPTIONS,
        NETLANG_HTTPS_HEAD,
        NETLANG_HTTPS_CONNECT,
        NETLANG_HTTPS_TRACE,
        NETLANG_HTTPS_PATCH,
      };
      struct lib {
        void stream_method_to(const method_t& method,const char* url, const char* file_name) {
          std::string script = "$(which curl) -sSL '";
          script += url;
          script += "' -o '";
          script += file_name;
          script += "'";
          switch(method){
            default: // purposeful fall-through
            case method_t::NETLANG_HTTPS_GET:
              popen(script.c_str(),"w");
              break;
          }
        }
      };
      static inline std::unique_ptr<lib> make(){
        return std::make_unique<lib>();
      }
    };
  };
};

#endif
