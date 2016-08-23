const authCheck = (req, res, next) => {
	if (! req.user) return res.redirect('/auth');
	next();
};

module.exports = authCheck;