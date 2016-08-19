const express = require('express');
let r = express.Router();

r.get('/getSupportedCountries', (req, res) => {
	res.json({});
});

module.exports = r;