const config = {
	//	Where to store proxies
	'database filename': './db/data.ne',

	//	How often to compact database
	'database autocompaction interval': 5 * 1000,

	//	Symbol or symbols for splitting proxies in list
	'proxy splitter': '\n',

	//	Logger function
	'logger function': (data) => {
		let timestamp = new Date();
		console.log('LOG', timestamp.toUTCString() + ': ', data);
	},

	//	How often to check for proxies availability
	'check interval': 60 * 1000,
};

module.exports = config;