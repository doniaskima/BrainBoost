 import winston from "winston";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import express from "express";
import swaggerDocs from "./utils/swagger";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import User from "@models/user.model";
import { initProd } from "@startup/prod";
import { initDB } from "@startup/db";
import { initCORS } from "@startup/cors";
import { initLogger } from "@startup/logging";
import { initPassportJS } from "@startup/passport";
import { initRoutes } from "@routes/index";
import { initRateLimit } from "@startup/rate-limit";
import { createGroupMessage, createMessage, startMessage } from "@controllers/Message.controller";
import { saveMessage } from "@controllers/user.controllers";


const port = 3900;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

initPassportJS();
initLogger();
initDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(
  session({
    // Used to compute a hash
    secret:"AIzaSyA5o3lO8OCGJm53HWNW8gn49fAwJPnJxhQ",
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } when using HTTPS
    // Store session on DB
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb+srv://Elearning:Elearning@cluster0.smqolzo.mongodb.net/?retryWrites=true&w=majority",
    }),
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

initRoutes(app);
swaggerDocs(app, port);

 

let connectedUsers = new Map();
let groups: { [key: string]: any } = {};


io.on("connection", (socket) => {
  let { id } = socket;

  socket.on("connectUser", ({ name }) => {
    connectedUsers.set(name, [socket.id]);
    io.emit("onlineUsers", Array.from(connectedUsers.keys()));
  });

  socket.on("disconnect", () => {
    for (let key of connectedUsers.keys()) {
      if (connectedUsers.get(key)[0] === id) {
        connectedUsers.delete(key);
        break;
      }
    }
    io.emit("onlineUsers", Array.from(connectedUsers.keys()));
  });

  socket.on("startMessage", ({ senderId, receiverEmail }) => {
    startMessage(senderId, receiverEmail);
  });

  socket.on("sendMessage", ({ sender, receiver, message }) => {
    const { email, name } = receiver;
    let receiverSocketId =
      connectedUsers.get(name) === undefined
        ? false
        : connectedUsers.get(name)[1];
    let senderSocketId = connectedUsers.get(sender.name)[1];
    createMessage(sender._id, email, message).then(
      ({ info, isNewRecipient }) => {
        if (isNewRecipient && receiverSocketId) {
          io.to(receiverSocketId).emit("newRecipient", info);
        } else if (receiverSocketId) {
          io.to(receiverSocketId).emit("message", info);
        }
        io.to(senderSocketId).emit("message", info);
      }
    );
  });

  socket.on("saveMessage", ({ user, message }) => {
    let userSocketId = connectedUsers.get(user.name)[1];
    saveMessage(user._id, message).then((res) => {
      io.to(userSocketId).emit("savedMessage", res);
    });
  });

  socket.on("sendGroupMessage", ({ sender, group, message }) => {
    createGroupMessage(sender, group._id, message).then((res) => {
      io.to(`${group.name}:${group.groupCode}`).emit("groupMessage", res);
    });
  });

  socket.on("joinGroup", ({ userInfo, group }: { userInfo: any, group: any }) => {
    socket.join(`${group.name}:${group.groupCode}`);
    
    if (!groups[group.name]) {
      groups[group.name] = [userInfo];
    } else if (!groups[group.name].find((user: any) => user._id === userInfo._id)) {
      groups[group.name].push(userInfo);
    }
  });
  
  
});


server.listen(port, () => winston.info(`Listening on port ${port}...`));