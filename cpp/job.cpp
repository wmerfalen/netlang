#define __NETLANG_DEBUG__ 1
#include "transports/job.hpp"

std::string cron_exp = "* * * * *";

using value_t = uint8_t;
struct item_t {
	value_t start;
	value_t end;
	value_t divisor;
};
std::list<item_t> items;
using unit = uint16_t;
struct timestamp {
	unit minute;
	unit hour;
	unit dom;
	unit month;
	unit dow;
	bool pass;
	std::string name;
};
bool matches_minute(const timestamp* ts) {
	for(const auto& item : items) {
		if(ts->minute == item.start) {
			return true;
		}
	}
	return false;
}
void test_1() {
	items.clear();
	items.emplace_back(2,4,5);

	std::list<timestamp> tests;
	tests.emplace_back(
	    2, // minute 00:02:00
	    0, // 00:02:00 am
	    2, // 2nd of the month
	    1, // january
	    0, // sunday ? (TODO: confirm this)
	    true, // should pass
	    "minute 2 == 2"
	);
	tests.emplace_back(
	    0, // minute 00:00:00
	    0, // 00:02:00 am
	    2, // 2nd of the month
	    1, // january
	    0, // sunday ? (TODO: confirm this)
	    false, // should pass
	    "minute 0 != 2"
	);
	for(const auto& test : tests) {
		if(matches_minute(&test) == test.pass) {
			std::cout << "[PASS]: " << test.name << "\n";
		} else {
			std::cerr << "[FAIL]: " << test.name << "\n";
		}
	}
}

int main(int argc,char** argv) {
	if(argc > 1) {
		cron_exp = argv[1];
	}
	test_1();
	auto lib = netlang::transports::job::make();
	lib->job_define(cron_exp,[]() -> void {
		std::cout << "Hi\n";
		time_t t = time(nullptr);
		std::cout << ctime(&t) << "\n";
	});
	return 0;
}
