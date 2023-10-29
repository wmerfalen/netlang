#ifndef __NETLANG_TRANSPORTS_JOB_HEADER__
#define __NETLANG_TRANSPORTS_JOB_HEADER__

#include <iostream>
#include <memory>
#include <functional>
#include <string>
#include <time.h>
#include <list>
#include <utility>
#include <iostream>
#include <tuple>
#include <boost/format.hpp>
#include <boost/algorithm/string/join.hpp>
#include "cron_parser.hpp"
#include <optional>

namespace netlang {
	namespace transports {
		namespace job {
			enum method_t : uint8_t {
				NETLANG_DEFINE = 0,
			};
			struct lib {
				using cron_field_t = std::tuple<uint8_t,uint8_t,uint8_t>;
				lib() : sane_cron(false), keep_running(true) {}
				int parse() {
					try {
						schedule = sched::parse_cron(cron_expression);
						minute = extract_field(1);
						hour = extract_field(2);
						day_of_month = extract_field(3);
						month = extract_field(4);
						day_of_week = extract_field(5);


						auto field_to_string = [](const sched::Field& field) {
							std::list<std::string> items;

							for(auto& item: field) {
								items.push_back((boost::format("%1%-%2%:%3%")
								                 % +std::get<0>(item)
								                 % +std::get<1>(item)
								                 % +std::get<2>(item)
								                ).str());
							}

							return boost::algorithm::join(items, ", ");
						};

						std::cout << (boost::format(
						                  "seconds:       %1%\n"
						                  "minutes:       %2%\n"
						                  "hours:         %3%\n"
						                  "day of month:  %4%\n"
						                  "month:         %5%\n"
						                  "day of week:   %6%\n"
						              ) % field_to_string(std::get<0>(schedule))
						              % field_to_string(std::get<1>(schedule))
						              % field_to_string(std::get<2>(schedule))
						              % field_to_string(std::get<3>(schedule))
						              % field_to_string(std::get<4>(schedule))
						              % field_to_string(std::get<5>(schedule))
						             ).str();
					} catch(std::invalid_argument& e) {
						std::cerr << "invalid cron expression: " << e.what() << std::endl;
						return -1;
					}

					return 0;
				}
				void job_define(const std::string& cron_string,const std::function<void()>& param_logic) {
					sane_cron = false;
					cron_expression = cron_string;
					logic = param_logic;
					if(parse() == 0) {
						sane_cron = true;
						tick();
						return;
					}
					cron_expression = std::string("* ") + cron_expression;
					if(parse() == 0) {
						sane_cron = true;
						tick();
						return;
					}
				}
				cron_field_t extract_field(uint8_t field) {
					sched::Field& field = std::get<field>(schedule);
					std::list<std::string> items;
					for(const auto& col : field) {
						return {std::get<0>(col),std::get<1>(col),std::get<2>(col)};
					}
					return {0,0,0};
				}
				void tick() {
					while(keep_running) {
						if(std::get<0>(minute) == 255) {
							logic();
						}
						sleep(60);
					}
				}
				bool keep_running;
				time_t next_run;
				std::string cron_expression;
				std::function<void()> logic;
				bool sane_cron;
				sched::Schedule schedule;
				cron_field_t minute;
				cron_field_t hour;
				cron_field_t day_of_month;
				cron_field_t month;
				cron_field_t day_of_week;;
			};
			static inline std::unique_ptr<lib> make() {
				return std::make_unique<lib>();
			}
		};
	};
};

#endif
