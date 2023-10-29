#ifndef __NETLANG_TRANSPORTS_JOB_HEADER__
#define __NETLANG_TRANSPORTS_JOB_HEADER__
#include "job-headers.hpp"

namespace netlang {
	namespace transports {
		namespace job {
			enum method_t : uint8_t {
				NETLANG_DEFINE = 0,
			};
			struct lib {
				using cron_field_t = std::list<std::tuple<uint8_t,uint8_t,uint8_t>>;
				lib() : second_attempt(false), sane_cron(false), keep_running(true) {}
#ifdef __NETLANG_DEBUG__
#define dump() this->m_dump()
				void m_dump() {
					std::cout << "minute ";
					for(const auto& c : minute) {
						std::cout << std::to_string(std::get<0>(c)) << "-" << std::to_string(std::get<1>(c)) << ":" << std::to_string(std::get<2>(c)) << ", ";
					}
					std::cout << "\n";
					std::cout << "hour ";
					for(const auto& c : hour) {
						std::cout << std::to_string(std::get<0>(c)) << "-" << std::to_string(std::get<1>(c)) << ":" << std::to_string(std::get<2>(c)) << ", ";
					}
					std::cout << "\n";
					std::cout << "day_of_month ";
					for(const auto& c : day_of_month) {
						std::cout << std::to_string(std::get<0>(c)) << "-" << std::to_string(std::get<1>(c)) << ":" << std::to_string(std::get<2>(c)) << ", ";
					}
					std::cout << "\n";
					std::cout << "month ";
					for(const auto& c : month) {
						std::cout << std::to_string(std::get<0>(c)) << "-" << std::to_string(std::get<1>(c)) << ":" << std::to_string(std::get<2>(c)) << ", ";
					}
					std::cout << "\n";
					std::cout << "day_of_week ";
					for(const auto& c : day_of_week) {
						std::cout << std::to_string(std::get<0>(c)) << "-" << std::to_string(std::get<1>(c)) << ":" << std::to_string(std::get<2>(c)) << ", ";
					}
					std::cout << "\n";
				}
#else
#define dump() /**/
#endif
				int parse() {
					try {
						schedule = sched::parse_cron(cron_expression);
						sched::Field field = std::get<1>(schedule);
						for(const auto& col : field) {
							minute.emplace_back(std::get<0>(col),std::get<1>(col),std::get<2>(col));
						}
						field = std::get<2>(schedule);
						for(const auto& col : field) {
							hour.emplace_back(std::get<0>(col),std::get<1>(col),std::get<2>(col));
						}
						field = std::get<3>(schedule);
						for(const auto& col : field) {
							day_of_month.emplace_back(std::get<0>(col),std::get<1>(col),std::get<2>(col));
						}
						field = std::get<4>(schedule);
						for(const auto& col : field) {
							month.emplace_back(std::get<0>(col),std::get<1>(col),std::get<2>(col));
						}
						field = std::get<5>(schedule);
						for(const auto& col : field) {
							day_of_week.emplace_back(std::get<0>(col),std::get<1>(col),std::get<2>(col));
						}
					} catch(std::invalid_argument& e) {
						if(second_attempt) {
							std::cerr << "invalid cron expression: " << e.what() << std::endl;
						}
						return -1;
					}

					return 0;
				}
				void job_define(const std::string& cron_string,const std::function<void()>& param_logic) {
					second_attempt = false;
					sane_cron = false;
					cron_expression = cron_string;
					logic = param_logic;
					if(parse() == 0) {
						sane_cron = true;
						tick();
						return;
					}
					second_attempt = true;
					cron_expression = std::string("* ") + cron_expression;
					if(parse() == 0) {
						sane_cron = true;
						tick();
						return;
					}
				}
				void tick() {
					dump();
					while(keep_running) {
						if((time(nullptr) % 60) == 0) {
							// The minute has changed
							logic();
							while((time(nullptr) % 60) == 0) {
								usleep(800000);
							}
						}
						usleep(800000);
					}
				}
				time_t cur_time;
				bool keep_running;
				bool sane_cron;
				bool second_attempt;
				time_t next_run;
				std::string cron_expression;
				std::function<void()> logic;
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
