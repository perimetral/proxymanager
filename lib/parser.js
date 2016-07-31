const request = require('request');

const parser = (db, data) => {
	data = (data ? data.split(c('proxy splitter')) : []);
	data.forEach((x, i, ar) => {
		let xSplitted = x.split(':');
		let host = xSplitted[0];
		let port = xSplitted[1];
		db.findOne({ host }, (e, result) => {
			if (e) throw new Error(e);
			if (result) return undefined;
			db.insert({
				host,
				port,
			}, (e, insCount) => {
				if (e) throw new Error(e);
				c('logger function')(host + ':' + port + ' proxy added to list');
			});
		});
	});
	setInterval(() => {
		db.find({}, (e, result) => {
			if (e) throw new Error(e);
			if ((! result) || (! result.length)) return undefined;
			result.forEach((x, i, ar) => {
				request.get(x.host + ':' + x.port, (e, response, body) => {
					if (e || (response.statusCode != 200)) db.remove({ host: x.host }, { multi: true}, (e, rmCount) => {
						if (e) throw new Error(e);
						c('logger function')(x.host + ':' + x.port + ' proxy removed from list');
					});
				});
			});
		});
	}, c('check interval'));
};

module.exports = parser;