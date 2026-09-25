const express = require("express");
const cors = require("cors");
const multer = require("multer");

const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectMemberRoutes = require("./routes/projectMemberRoutes");

const db = require("./models");
const http = require("http");
const { Server } = require("socket.io");
// const path = require("path");
// const { error } = require("console");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://project-management-system-theta-tan.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Project Management API is running",
  });
});

app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", projectMemberRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size must not exceed 10 MB",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }

  if (error.message === "File type is not allowed") {
    return res.status(400).json({
      message: error.message,
    });
  }

  console.error("Unhandled server error:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

db.sequelize
  .authenticate()
  .then(async () => {
    console.log("Sequelize connected to PostgreSQL");

    // const [result] = await db.sequelize.query(`
    //   SELECT current_database() AS database,
    //          current_user AS user
    // `);

    // console.log("Connected DB:", result);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Sequelize connection failed:", error));
io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);

  socket.on("joinProject", (projectId) => {
    const roomName = `project-${projectId}`;

    socket.join(roomName);

    console.log(`Socket ${socket.id} joined ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// // Initialize Socket.IO
// require("./socket/socketServer")(io);

// io.on("connection", (socket) => {
//   console.log("User connected", socket.id);

//   socket.on("joinProject", (projectId) => {
//     socket.join(`project-${projectId}`);

//     console.log(`Socket ${socket.id} joined project-${projectId}`);
//   });

//   socket.on("sendMessage", async (data) => {
//     console.log("Message received:", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnect", socket.id);
//   });
// });

// const { User } = require("./models");

// User.findAll()
//   .then((users) => {
//     console.log("Users:", users);
//   })
//   .catch((error) => {
//     console.error("User test failed:", error);
//   });
