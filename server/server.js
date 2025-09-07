const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

require('./config/dbConfig'); // Ensure DB is connected

const server = require('./app'); // Import HTTP server with Socket.io
const port = process.env.PORT_NUMBER || 5000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
