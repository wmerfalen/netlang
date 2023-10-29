#ifndef __NETLANG_TRANSPORTS_CRONTAB_HEADER__
#define __NETLANG_TRANSPORTS_CRONTAB_HEADER__

#include <iostream>
#include <memory>

namespace netlang {
	namespace transports {
		namespace crontab {
			enum method_t : uint8_t {
				NETLANG_CRONTAB_RUN = 0,
			};
			struct lib {
			};
			static inline std::unique_ptr<lib> make() {
				return std::make_unique<lib>();
			}
		};
	};
};

#endif
