const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const config = require('./config/config');

const startServer = async () => {
  await connectDB();
  await connectRedis();
  scheduleJobs();

  const server = http.createServer(app);
  const io = new socketio.Server(server, {
    cors: {
      origin: '*',
    },
  });

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
