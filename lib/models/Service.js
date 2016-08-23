const Nedb = require('nedb');
const proxy = require('http-proxy');
const events = require('events');
const util = require('util');

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
		proxyServer.on('proxyReq', (proxyReq, req, res, opts) => {
			res = c('proxy modify response')(res);
			let frame = {
				headers: req.headers,
				httpVersion: req.httpVersion,
				method: req.method,
				rawHeaders: req.rawHeaders,
				socket: req.socket,
				url: req.url,
			};
			frame = Object.assign(frame, opts);
			this.log('REQUEST', frame).then((entry) => {
				this.emit(options.events.proxyReq, {
					proxyId: this.proxyId,
				});
			}).catch((e) => { log(e); });
		});
		proxyServer.on('proxyRes', (proxyRes, req, res) => {
			let frame = {
				headers: proxyRes.headers,
				httpVersion: proxyRes.httpVersion,
				method: proxyRes.method,
				rawHeaders: proxyRes.rawHeaders,
				socket: proxyRes.socket,
				url: proxyRes.url,
			};
			this.log('RESPONSE', frame).then((entry) => {
				this.emit(options.events.proxyRes, {
					proxyId: this.proxyId,
				});
			}).catch((e) => { log(e); });
		});
		this.proxyServer = proxyServer;
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

	log (...args) {
		return new Promise((go, stop) => {
			let entry = '\n' + c('clean logger')(...args);
			this.journal.push(entry);
			this.services.update({
				target: this.target,
				port: this.port,
				proxyId: this.proxyId,
			}, { $set: { journal: this.journal } }, { multi: true }, (e, updCount) => {
				if (e) return stop(e);
				return go();
			});
		});
	}
};

module.exports = Service;