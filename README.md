# Overview
Netlang is an experimental network programming language. This programming language is merely a hobby project to allow me to get familiar with Typescript.

# How it works
The language is parsed using Typescript and transpiled to C++.

# Features
## https requests piped to a file
```
https.get('https://github.com/wmerfalen/repositories') => wmerfalen.html;
```

The above code will perform a curl request to the url in question then pipe that to a file named `wmerfalen.html`.
This is currently done by using the binary located in your PATH instead of actually setting up `libcurl` and doing the request setup in C++. This is simply to save time and will likely be replaced in the future with actual `libcurl` API calls.

# Upcoming features
## Crontab.run
It will be possible to do something like:
```
crontab.run('* * * * *',[]() -> {
  icmp.echo_request('192.168.1.*') |=> [pg.uptime]
})
```

What this does is it runs the lambda every second as if it were run by a cron job. The binary will run this job as long as it is up and running. There are no mechanisms to keep the binary running if an error causes the binary to crash for some reason. That will be up to the user to handle. The `|=> [pg.uptime]` is a database storage call which means the results of the echo request will be stored in the postgres table named `uptime`. To import database credentials, it is advised that you include a `.env` file at the beginning of your program:

```
%include ".env"
```

When included, the program will expect the following key/value pairs exist in order to connect to your db backend properly:
```
DB_USER=username
DB_PASSWORD=password1234
DB_NAME=your-db-name-here
DB_HOST=0.0.0.0
DB_PORT=5432
```

This is a familiar format of .env if you're used to using the `dotenv` npm package of the node.js ecosystem.

## Database I/O
We already described the database storage call above using the `|=> [backend.table]` syntax. It will be possible to read from a database table using `<=| [backend.table]`. This is useful when you want to host a resource at a specific endpoint:
```
https.host('/api/v1/users',8080) <=| [pg.users(id,first_name,last_name)]
```

This will allow you to setup an endpoint at `/api/v1/users` which will return the contents of your `postgres` table named `users`. In addition to this, it will only fetch the following columns: `id,first_name,last_name`.

## ssh mounting
It will be possible to utilize ssh port forwarding so that you can host different services under different URL "namespaces".

```
[8080:localhost:9090] => 'user@dev-server'
```

This will be the equivalent of running `ssh -R 8080:localhost:9090 user@dev-server`. This will forward the port 8080 on `dev-server` to your localhost on port `9090`.

It will be possible to also use the `-L` equivalent:

```
'user@dev-server' => [8080::9090]
```

This will be the equivalent of running `ssh -L 8080::9090 user@dev-server`. This will forward the localhost port of `8080` to the localhost port of `9090` at `dev-server`.


## crontab syntactic sugar
Ideally, it would be possible to define crontabs using a simplified syntax:
```
<* * * * *,icmp.echo_request('192.168.1.*') |=> [pg.uptime]>
```

This has multiple syntactic sugars combined. Firstly, it uses angle braces instead of `crontab.run`. Secondly, it defines a one-line lambda without using `[]() -> {` as a prefix. 


## lambda capture and parameter syntax
Currently, the way to define lambdas is quite limited. It has to be done like:
```
[]() -> {
  your code goes here
  your code goes here
  your code goes here
  ...
}
```

The intended functionality here is that there are zero captures and zero parameters. When this feature is fully implemented, it should look a lot like how C++ lambda's look:

```
[&](int job_id) -> {
  your code goes here
  ...
}
```

Where `&` means capture everything by reference and `int job_id` defines one parameter that is named `job_id` and can be referenced in the lambda body


# Version
1.0.0

# LICENSE
See LICENSE file.

