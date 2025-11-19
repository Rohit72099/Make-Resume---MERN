const mongoose = require('mongoose');
const debug = require('debug')('app:db');

const connectDB = async (mongoUri) => {
	try {
		const uri = mongoUri || process.env.MONGODB_URI;
		if (!uri) throw new Error('MONGODB_URI not provided');
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		debug('MongoDB connected');
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
