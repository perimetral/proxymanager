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
				return;
			});
			return;
		});
		return;
	});
	return;
};

module.exports = parser;