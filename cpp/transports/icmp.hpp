#ifndef __NETLANG_TRANSPORTS_HTTPS_HEADER__
#define __NETLANG_TRANSPORTS_HTTPS_HEADER__

#include <iostream>
#include <memory>

namespace netlang {
	namespace transports {
		namespace icmp {
			enum method_t : uint8_t {
				NETLANG_ICMP_ECHO_REQUEST = 0,
			};
			struct lib {
				void echo_request(const std::string& host) {

				}
			};
			static inline std::unique_ptr<lib> make() {
				return std::make_unique<lib>();
			}
		};
	};
};

#endif
