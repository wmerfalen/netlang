#ifndef __NETLANG_TRANSPORTS_DB_HEADER__
#define __NETLANG_TRANSPORTS_DB_HEADER__
#include "job-headers.hpp"
#include <iostream>
#include <pqxx/pqxx>
#include <list>

namespace netlang {
	namespace transports {
		namespace db {
			struct lib {
					lib() = delete;
					std::list<std::tuple<std::string,int>> query_employee() {
						if(!connection) {
							return {};
						}
						pqxx::work tx{*connection};
						std::list<std::tuple<std::string,int>> list;
						for(const auto & [name, salary] : tx.query<std::string, int>(
						            "SELECT name, salary FROM employee ORDER BY name")) {
							list.emplace_back(name,salary);
						}
						return list;
					}
					std::string make_connection_string(const std::string& host,
					                                   const std::string& port,
					                                   const std::string& user,
					                                   const std::string& pass,
					                                   const std::string& dbname) {
						std::string str = "postgresql://";
						str += user + ":";
						str += pass + "@";
						str += host + ":";
						str += port + "/";
						str += dbname;
						return str;
					}
					bool connect(const std::string& host,
					             const std::string& port,
					             const std::string& user,
					             const std::string& pass,
					             const std::string& dbname) {
						connection_string = make_connection_string(host,port,user,pass,dbname);
						return connect(connection_string);
					}
					bool connect(const std::string& con_string) {
						connection = nullptr;
						connection_string = con_string;
						try {
							connection = std::make_unique<pqxx::connection>(connection_string);
							connection_status = std::make_pair<std::string,int>("ok",0);
							return true;
						} catch(const std::exception& e) {
							connection_status = std::make_pair<std::string,int>(e.what(),-1);
							return false;
						}
					}
					const std::pair<std::string,int>& get_connection_status() const {
						return connection_status;
					}
					void debug(const std::string& msg) {
						std::cout << "DEBUG: " << msg << "\n";
					}
					lib(const std::string& host,
					    const std::string& port,
					    const std::string& user,
					    const std::string& pass,
					    const std::string& dbname) {
						try {
							if(!connect(host,port,user,pass,dbname)) {
								this->debug("couldn't connect to db");
								this->debug(connection_status.first);
								return;
							}
							// at the same time, even to the same database.
							std::cout << "Connected to " << connection->dbname() << '\n';

							// Start a transaction.  A connection can only have one transaction
							// open at the same time, but after you finish a transaction, you
							// can start a new one on the same connection.
							pqxx::work tx{*connection};

							// Query data of two columns, converting them to std::string and
							// int respectively.  Iterate the rows.
							for(auto [name, salary] : tx.query<std::string, int>(
							            "SELECT name, salary FROM employee ORDER BY name")) {
								std::cout << name << " earns " << salary << ".\n";
							}

							// For large amounts of data, "streaming" the results is more
							// efficient.  It does not work for all types of queries though.
							//
							// You can read fields as std::string_view here, which is not
							// something you can do in most places.  A string_view becomes
							// meaningless when the underlying string ceases to exist.  In this
							// one situation, you can convert a field to string_view and it
							// will be valid for just that one iteration of the loop.  The next
							// iteration may overwrite or deallocate its buffer space.
							for(auto [name, salary] : tx.stream<std::string_view, int>(
							            "SELECT name, salary FROM employee")) {
								std::cout << name << " earns " << salary << ".\n";
							}

							// Execute a statement, and check that it returns 0 rows of data.
							// This will throw pqxx::unexpected_rows if the query returns rows.
							std::cout << "Doubling all employees' salaries...\n";
							tx.exec0("UPDATE employee SET salary = salary*2");

							// Shorthand: conveniently query a single value from the database.
							int my_salary = tx.query_value<int>(
							                    "SELECT salary FROM employee WHERE name = 'Me'");
							std::cout << "I now earn " << my_salary << ".\n";

							// Or, query one whole row.  This function will throw an exception
							// unless the result contains exactly 1 row.
							auto [top_name, top_salary] = tx.query1<std::string, int>(
							                                  R"(
                    SELECT name, salary
                    FROM employee
                    WHERE salary = max(salary)
                    LIMIT 1
                )");
							std::cout << "Top earner is " << top_name << " with a salary of "
							          << top_salary << ".\n";

							// If you need to access the result metadata, not just the actual
							// field values, use the "exec" functions.  Most of them return
							// pqxx::result objects.
							pqxx::result res = tx.exec("SELECT * FROM employee");
							std::cout << "Columns:\n";
							for(pqxx::row_size_type col = 0; col < res.columns(); ++col) {
								std::cout << res.column_name(col) << '\n';
							}

							// Commit the transaction.  If you don't do this, the database will
							// undo any changes you made in the transaction.
							std::cout << "Making changes definite: ";
							tx.commit();
							std::cout << "OK.\n";
						} catch(std::exception const& e) {
							std::cerr << "ERROR: " << e.what() << '\n';
							return;
						}
					}
					~lib() = default;
				private:
					std::unique_ptr<pqxx::connection> connection;
					std::string connection_string;
					std::pair<std::string,int> connection_status;
			};
			static inline std::unique_ptr<lib> make(
			    const std::string& host,
			    const std::string& port,
			    const std::string& user,
			    const std::string& pass,
			    const std::string& db_name) {
				return std::make_unique<lib>(host,port,user,pass,db_name);
			}
		};
	};
};

#endif
