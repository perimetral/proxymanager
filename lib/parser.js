const checker = require('./checker');

const parser = (db, data) => {
	console.log('Parsing data ...');
	const worker = (host, port) => {
		checker(host, port, c('check url')).then(() => {
			db.findOne({ host }, (e, result) => {
				if (e) throw new Error(e);
				if (result) return undefined;
				db.insert({
					host,
					port,
					available: true,
				}, (e, insCount) => {
					if (e) throw new Error(e);
					c('logger function')(host + ':' + port + ' proxy added to list');
				});
			});
		}).catch((status, e) => {
			db.findOne({ host }, (err, result) => {
				if (err) throw new Error(err);
				if (result) return undefined;
				db.insert({
					host,
					port,
					available: false,
				}, (err, insCount) => {
					if (err) throw new Error(err);
					c('logger function')(host + ':' + port + ' proxy added to list, but it is broken');
				});
			});
		});
	};

	if (typeof data === 'object') {
		for (let i in data) worker(i, data[i]);
		return;
	};
	data = (data ? data.split(c('proxy splitter')) : []);
	data.forEach((x, i, ar) => {
		let xSplitted = x.split(':');
		worker(xSplitted[0], xSplitted[1]);
	});
	return;
};

module.exports = parser;