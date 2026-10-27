const mongoose = require('mongoose');
let isConnected = false;
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fake_news_shield';    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(` MongoDB Atlas Connection Error: ${err.message}`);
       isConnected = false;
    return null;
  }
};
const getIsConnected = () => isConnected;

module.exports = { connectDB,  getIsConnected};

