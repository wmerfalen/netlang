#include <iostream>
#include "transports/job.hpp"
#include <memory>

int main(int argc,char** argv) {
	if(argc < 2) {
		std::cout << "Usage: " << argv[0] << " <cron-expression>\n";
		return 1;
	}
	auto lib = netlang::transports::job::make();
	lib->job_define(argv[1],[]() -> void {
		std::cout << "Hi\n";
	});
	return 0;
}
