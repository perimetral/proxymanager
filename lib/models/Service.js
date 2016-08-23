const Nedb = require('nedb');
const proxy = require('http-proxy');
const events = require('events');

class Service extends events.EventEmitter {
	constructor (options) {
		super(options);
		options.events = options.events || {};
		options.events.created = options.events.created || 'created';
		options.events.proxyReq = options.events.proxyReq || 'proxyReq';
		options.events.proxyRes = options.events.proxyRes || 'proxyRes';

		this.services = options.services || new Nedb({
			filename: c('database nedb services'),
			autoload: true,
		});
		this.services.persistence.setAutocompactionInterval(c('database nedb autocompaction interval'));
		this.journal = [];
		this.target = options.target;
		this.port = options.port;
		this.proxyId = options.proxyId;

		let proxyServer = undefined;
		try {
			proxyServer = proxy.createProxyServer({
				target: this.target,
			}).listen(this.port, () => {
				this.log('USING ' + this.target + ' AS PROXY SERVER AT PORT ' + this.port.toString()).then((entry) => {
					this.emit(options.events.created, {
						proxyId: this.proxyId,
					});
				}).catch((e) => { log(e); });
			});
		} catch (e) {
			log(e);
			return this;
		};
		proxyServer.on('proxyReq', (...args) => {
			let data = c('proxy log middleware')(...args);
			this.log('REQUEST' + data).then((entry) => {
				this.emit(options.events.proxyReq, {
					proxyId: this.proxyId,
					data,
				});
			}).catch((e) => { log(e); });
		});
		proxyServer.on('proxyRes', (...args) => {
			let data = c('proxy log middleware')(...args);
			this.log('RESPONSE' + data).then((entry) => {
				this.emit(options.events.proxyRes, {
					proxyId: this.proxyId,
					data,
				});
			}).catch((e) => { log(e); });
		});
		this.services.findOne({
			target: this.target,
			port: this.port,
			proxyId: this.proxyId,
		}, (e, data) => {
			if (e) return;
			if (data) {
				this.journal = data.journal;
				log(this.journal);
			} else {
				this.services.insert({
					target: this.target,
					port: this.port,
					proxyId: this.proxyId,
					journal: this.journal,
				});
			};
		});
	}

	log (data) {
		return new Promise((go, stop) => {
			let entry = c('clean logger')(data);
			this.journal.push(entry);
			//this.services
			//	MAKE JOURNAL UPDATE
			log(data);
		});
	}
};

module.exports = Service;