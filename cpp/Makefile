INCLUDES=-I$(PWD)/boost_1_83_0 -I$(PWD)/boost-includes/
LIBS=-lpthread -lpqxx -lpq
BUILD_DIR=build
all: main-tcp.cpp job
	g++ -std=c++20 $(INCLUDES) main-tcp.cpp -o tc $(LIBS)
job:
	g++ -std=c++20 $(INCLUDES) -o $(BUILD_DIR)/job job.cpp $(LIBS)

job-headers.hpp:
	g++ -std=c++20 $(INCLUDES) transports/job-headers.hpp

job.hpp:
	g++ -std=c++20 $(INCLUDES) transports/job.hpp

