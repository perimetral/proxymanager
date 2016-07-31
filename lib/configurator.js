const configuratorBuilder = (options) => {
	var config = Object.assign({}, options.initial);

	const configurator = (name, value) => {
		if (value === undefined) return (name in config ? config[name] : undefined);
		else {
			config[name] = value;
			return config[name];
		};
	};

	return configurator;
};

module.exports = configuratorBuilder;