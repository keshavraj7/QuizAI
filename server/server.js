require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const connectDB = require("./config/db");
const quizRoutes = require("./routes/quizRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes =
require("./routes/roomRoutes");
const app = express();
const PORT=process.env.PORT|| 5000
connectDB();

app.use(cors({origin: true,credentials: true}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.use("/api/auth",authRoutes);
app.use("/api/quiz",quizRoutes);
app.use(
    "/api/room",
    roomRoutes
);
app.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected Route",
      user: req.user,
    });
  }
);
const http =
require("http");

const { Server } =
require("socket.io");

const server =
http.createServer(app);

const io =
new Server(server,{
    cors:{
        origin:true
    }
});

app.set("io",io);

io.on(
    "connection",
    socket=>{

        console.log(
            "Connected:",
            socket.id
        );

        socket.on(
            "join-room",
            roomCode=>{

                socket.join(
                    roomCode
                );

            }
        );

        socket.on(
            "disconnect",
            ()=>{

                console.log(
                    "Disconnected:",
                    socket.id
                );

            }
        );

    }
);

server.listen(
    PORT,
    ()=>{
        console.log(
            `Server Started on Port ${PORT}`
        );
    }
);