#include <iostream>
#include "transports/factory.hpp"
#include <memory>
#include "transports/crontab.hpp"
#include "transports/icmp.hpp"
#include "transports/job.hpp"
#include "transports/ssh.hpp"
#include "transports/https.hpp"
#include "transports/db.hpp"

static constexpr const char* DB_NAME = "test_db";
static constexpr const char* DB_USER = "test_user";
static constexpr const char* DB_PASS = "turtlecommand4321";
static constexpr const char* DB_HOST = "0.0.0.0";
static constexpr const char* DB_PORT = "5432";

struct cmd {
	std::string cron_string;

};
static std::vector<cmd> commands;

int main(int argc,char** argv) {

	std::cout << "main\n";
	auto lib = netlang::transports::db::make(DB_HOST,DB_PORT,DB_USER,DB_PASS,DB_NAME);
	auto m = lib->query_employee();
	for(const auto& _m : m) {
		std::cout << std::get<0>(_m) << ": " << std::get<1>(_m) << "\n";
	}
#if 0
	if(argc > 1) {
		for(unsigned i=1; i < argc; i++) {
			std::string arg = argv[i];
			if(arg.length() > strlen("--cron=") && arg.substr(0,strlen("--cron=")).compare("--cron=") == 0) {
				commands.emplace_back(arg.substr(strlen("--cron=")));
			}
		}
	}
	for(const auto& c : commands) {
		std::cout << c.cron_string << "\n";
	}

	auto lib_crontab_Po7swnWz = netlang::transports::crontab::make();
	lib_crontab_Po7swnWz->run("* * * * *",[]() -> {auto lib_icmp_gv0WLzhF = netlang::transports::icmp::make();

	                                               lib_icmp_gv0WLzhF.echo_request("192.168.1.*","pg","uptime");

	                                               lib_icmp_gv0WLzhF.echo_request("192.168.0.*","pg","uptime");
	                                              });
//auto lib_job_SowrgPWA = netlang::transports::job::make();
//lib_job_SowrgPWA->job_define("backup-db",[]() -> {auto lib_ssh_6P36e8Hc = netlang::transports::ssh::make();
//});
//auto lib_https_g64jnAgh = netlang::transports::https::make();
//lib_https_g64jnAgh->when("post","/api/v1/backup-db","singleton","backup-db");

#endif
	return 0;
}
