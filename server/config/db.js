const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServerForTeardown = null;

const connectDB = async () => {
  try {
    // Try with original 2-second timeout first
    const conn = await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed: ${error.message}`);
    console.log(`⚠️  Your current IP might not be whitelisted in MongoDB Atlas`);
    console.log(`⚠️  Spinning up fallback MongoDB Memory Server so the app can run...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      mongoServerForTeardown = mongoServer;
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Successfully started fallback MongoDB Memory Server at: ${mongoUri}`);
      
      // Because it's an empty DB, let's auto-seed it so the dashboard has data
      try {
        const User = require('../models/User'); // Explicitly import the model here
        await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password', // Demo password
          role: 'admin',
          status: 'active',
        });
        console.log(`✅ Memory Database seeded with admin user (admin@example.com / password)`);
      } catch (seedError) {
        console.log(`⚠️  Could not auto-seed memory DB: ${seedError.message}`);
      }
    } catch (memError) {
      console.error(`❌ Fallback MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;
