#ifndef __NETLANG_TRANSPORTS_TCP_HEADER__
#define __NETLANG_TRANSPORTS_TCP_HEADER__

#include <iostream>
#include <memory>
#include <string>
#include "boost/asio.hpp"
#include <algorithm>
#include <array>


namespace netlang {
  namespace transports {
    namespace tcp {
      enum method_t : uint8_t {
        NETLANG_TCP_LISTEN = 0,
        NETLANG_TCP_OPEN_AND_WAIT,
        NETLANG_TCP_TRADE_MESSAGE,
        NETLANG_TCP_PIPE_TO,
        NETLANG_TCP_PIPE_FROM,
        NETLANG_TCP_WEBSOCKET_CONNECT,
        NETLANG_TCP_CONNECT_SCAN,
      };
      struct lib {
			  using tcp = boost::asio::ip::tcp;
				boost::asio::io_context io_context;
        std::unique_ptr<tcp::socket> socket;
        std::unique_ptr<tcp::resolver> resolver;
        lib() {
						socket = std::make_unique<tcp::socket>(io_context);
						resolver = std::make_unique<tcp::resolver>(io_context);
        }
        void reportError(std::string msg){
          std::cerr << "[bytecode-error]: '" << msg << "'\n";
        }
				int initiate_connection_to(const char* hostname,const char* port){
						boost::asio::connect(*socket, resolver->resolve(hostname, port));
						return 0;
				}
        int send_file_contents(const std::string& file_name){
          int bytes = 0;
          FILE* fp = fopen(file_name.c_str(),"r");
          if(!fp){
            this->reportError("failed to open file");
            return -1;
          }
          std::array<char,1024> buffer;
          while(!feof(fp)){
            std::fill(buffer.begin(),buffer.end(),0);
            int tmp_bytes = fread(&buffer[0],sizeof(char),sizeof(buffer)-1,fp);
            if(tmp_bytes){
              if(tmp_bytes > sizeof(buffer)){
                tmp_bytes = sizeof(buffer);
              }
              buffer[tmp_bytes - 1]=0;
						  auto result = boost::asio::write(*socket, boost::asio::buffer(std::string(&buffer[0])));
              bytes += result;
            } else {
              break;
            }
          }
          fclose(fp);

          return bytes;
        }
        void close(){
						boost::system::error_code ec;
						socket->shutdown(boost::asio::ip::tcp::socket::shutdown_both, ec);
						socket->close();
        }
			};// end lib
      static inline std::unique_ptr<lib> make(){
        return std::make_unique<lib>();
      }
  }; // end namespace tcp
}; // end namespace transports

};// end namespace netlang
#endif
