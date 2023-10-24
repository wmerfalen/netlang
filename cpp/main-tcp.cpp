#include <iostream>
#include "transports/tcp.hpp"
#include <memory>

int main(int argc,char** argv) {
	std::unique_ptr<netlang::transports::tcp::lib> lib = netlang::transports::tcp::make();
	lib->initiate_connection_to("developer.mozilla.org","80");
	lib->send_file_contents("get-request");
	return 0;
}
