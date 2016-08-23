# proxymanager

### Install
You can simply install it by casting:

`npm i perimetral/proxymanager`

or as standalone application:

`git clone https://github.com/perimetral/proxymanager.git`
### Explanation
Actually there is fully workable proxy manager. You need working and configured Mongo to run it. Do it by casting:

`node index.js`

Then restore Mongo dump from `dump` folder. It contains admin account which is used to authenticate.
Login as `admin` with default password `a`

### Configuration
Simply edit **config.js** as you need.

* `database nedb proxies` (string, default is `./db/proxies.ne`): where to store proxy list;
* `database nedb services` (string, default is `./db/services.ne`): where to store active proxies;
* `database nedb autocompaction interval` (number in milliseconds, default is `5000`): how often to compact database;
* `database mongo url` (string, default is `mongodb://localhost:27017/proxymanager`): Mongo connection string;
* `proxy splitter` (string, default is `\n`): symbols to split proxies in proxy list;
* `clean logger` (function, takes dynamic arguments): function for clean logging in terms of timestamp creating. Must return string or undefined;
* `logger` (function, takes dynamic arguments): function for loggins. By default performs call of `clean logger` and prints result to `stdout`;
* `proxy modify response` (function, takes proxified response): function to manipulate response from proxy to client before it will be finalized. Actually implements MitM attack as long as allows modifying headers and cert as easy as response body;
* `check url` (string, default is `http://www.rhymezone.com/`): which URL to use while testing proxies;
* `check interval` (number in milliseconds, default is `60000`): how often to check for proxies availability;
* `server host` (string, default is `localhost`): host to listen for connections;
* `server port` (number, default is `3033`): port to listen for connections;
* `server logger mode` (string, one of `combined`, `common`, `dev`, `short`, `tiny`, default is `dev`): Express native logger mode;
* `paths static` (string, default is `./public`): where to look for static files (like clientside js, css, etc.);
* `paths views` (string, default is `./views`): where to look for Handlebars views;
* `session secret length` (number, default is `512`): random session secret length, longer is better, but slower;
* `session ttl` (number in milliseconds, default is `14` days): how much to store session before automatic logging out;
