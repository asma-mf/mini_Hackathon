const dns = require('dns');
const mongoose = require('mongoose');

// On Windows / certain ISPs, Node.js default DNS resolver fails to resolve SRV records (querySrv ECONNREFUSED)
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb+srv')) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    // Ignore if environment restricts setting DNS servers
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

