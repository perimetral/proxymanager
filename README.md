# proxymanager

### Install
You can simply install it by casting:

`npm i perimetral/proxymanager`

or as standalone application:

`git clone https://github.com/perimetral/proxymanager.git`
### Explanation
Actually there is fully workable proxy manager. There are two files: `manager.js` and `listen.js` which are used for manipulating proxies and application. First of all, you may run

`node manager.js -f FILENAME`

to load proxy list from file or run

`node manager.js -w FULL_URL -m REQUEST_METHOD [--json]`

to scrap it from web. In case of scrapping, server must respond with `200` status code and text or JSON (if such option is specified) containing proxies.

Independent on method of getting proxy list, they must be in format `HOST:PORT` divided by splitter which is configurable.

You are free to use this file to update proxy list instead of refreshing it, because of new values will be appended to database instead of rewriting existing values (excluding cases of same `HOST:PORT` in which it will be just skipped). To clear proxy list just remove database file (see below to know where to find it).

For listening for requests just use `listen.js` without arguments. After running, it will listen for any HTTP connections at port which is configured and proxy all of connections to proxies from list which is defined by using `manager.js`. Notice `listen.js` will automatically refresh proxy list as long as there will be inactive ones in it.

### Configuration
Simply edit **config.js** as you need.

* `database filename` (string, default is `./db/data.ne`): where to store working proxies;
* `database autocompaction interval` (number in milliseconds, default is `5000`): how often to compact database;
* `proxy splitter` (string, default is `\n`): symbols to split proxies in proxy list;
* `logger function` (function, takes dynamic arguments): function for logging. As long as you asked me for logging but have not asked exactly for logging method, i decided to make it configurable, so redefine this function as you need. Default is console logging with timestamps in UTC format. Notice this function is used as is while proxying all of requests, so you may get much of data for just simple request, because of browser will also ask for favicon, styles, scripts and other stuff;
* `check interval` (number in milliseconds, default is `60000`): how often to check for proxies availability;
* `listen host` (string, default is `localhost`): host to listen for connections;
* `listen port` (number, default is `3000`): port to listen for connections;

### Testing
Add some new proxies by using `manager.js` and then run listener by using `listen.js`. After that you will be able to provide your proxy server URL (default is `localhost:3000`) to browser and use it like regular proxy server.
