INCLUDES=-I$(PWD)/boost_1_83_0 -I$(PWD)/boost-includes/
LIBS=-lpthread
all: main-tcp.cpp job
	g++ -std=c++20 $(INCLUDES) main-tcp.cpp -o tc $(LIBS)
job: job.cpp
	g++ -std=c++20 $(INCLUDES) job.cpp -o job $(LIBS)
