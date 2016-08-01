const request = require('request');

const checkProxy = (host, port, testUrl) => {
	return new Promise((go, stop) => {
		let url = ('http://' + host + ':' + port);
		let proxyRequest = request.defaults({ proxy: url, });
		proxyRequest(testUrl, { uri: testUrl }, (e, res) => {
			if (e) return stop(-1, e);
			else if (res.statusCode != 200) return stop(res.statusCode, e);
			else return go();
		});
	});
};

module.exports = checkProxy;