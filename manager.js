global.c = require('./lib/configurator')({ initial: require('./config') });

const Nedb = require('nedb');
const cli = require('commander');
const request = require('request');
const fs = require('fs');

const parser = require('./lib/parser');

const db = new Nedb({
	filename: c('database filename'),
	autoload: true,
});
db.persistence.setAutocompactionInterval(c('database autocompaction interval'));

cli
	.version('1.0.0')
	.option('-f, --filename <file>', 'Filename to load proxy list')
	.option('-w, --web <url>', 'Scrap proxy list from web')
	.option('-j, --json', 'Scrap in JSON format')
	.option('-m, --method <name>', 'Type of request to scrap. get is default')
	.parse(process.argv);

if (cli.web) {
	if (! cli.method) cli.method = 'get';
	else cli.method = cli.method.toLowerCase();
	let options = { url: cli.web };
	if (cli.json) options['content-type'] = 'application/json';
	request[cli.method](options, (e, response, body) => {
		if (e) throw new Error(e);
		if (response.statusCode != 200) throw new Error('Server failed with: ' + response.statusCode);
		parser(db, body);
		return;
	});
} else if (cli.filename) {
	fs.readFile(cli.filename, 'utf8', (e, data) => {
		if (e) throw new Error(e);
		parser(db, data);
		return;
	});
} else {
	parser(db, '');
	return;
};