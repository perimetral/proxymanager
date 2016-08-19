const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;
let Account = new mongoose.Schema({
	username: String,
	password: String,
	role: String,
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);