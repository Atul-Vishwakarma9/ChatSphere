const mongoose = require('mongoose');

const connectWithRetry = () => {
  mongoose.connect(process.env.CONN_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ DB Connection Successful!');
  })
  .catch((err) => {
    console.error('❌ DB Connection Failed:', err.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  });
};

// Start the connection
connectWithRetry();

// Optional: monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Trying to reconnect...');
  connectWithRetry();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose.connection;

