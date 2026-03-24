const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const config = require("./config/config");
const { generateAccessToken } = require("./utils/tokens");
const User = require("./models/User.model");
const Message = require("./models/Message.model");

const { scheduleJobs } = require("./services/cron.service");

const startServer = async () => {
  await connectDB();
  await connectRedis();
  scheduleJobs();

  const server = http.createServer(app);
  const io = new socketio.Server(server, {
    cors: {
      origin: "*"
    }
  });

  // Socket.io minimal auth using JWT access token
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.authorization;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }
      const parsedToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
      const payload = jwt.verify(parsedToken, config.jwt.accessSecret);
      socket.user = { id: payload.sub, role: payload.role };
      return next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Client should emit "joinAppointment" with appointmentId
    socket.on("joinAppointment", (appointmentId) => {
      socket.join(`appointment:${appointmentId}`);
    });

    socket.on("chatMessage", async ({ appointmentId, content }) => {
      if (!appointmentId || !content) return;
      try {
        const msg = await Message.create({
          appointment: appointmentId,
          sender: socket.user.id,
          content
        });
        io.to(`appointment:${appointmentId}`).emit("chatMessage", msg);
      } catch (err) {
        // For brevity, just log. In production, integrate better error handling/logging.
        console.error("Socket chatMessage error", err);
      }
    });
  });

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

