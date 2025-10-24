const mongoose = require('mongoose');

let connectionPromise = null;

/**
 * Creates or reuses a singleton MongoDB connection.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    connectionPromise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || 'ehr_demo',
      })
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
}

module.exports = { connectDB };

