import winston from "winston";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import express from "express";
import swaggerDocs from "./utils/swagger";

import { initProd } from "@startup/prod";
import { initDB } from "@startup/db";
import { initCORS } from "@startup/cors";
import { initLogger } from "@startup/logging";
import { initPassportJS } from "@startup/passport";
import { initRoutes } from "@routes/index";
import { initRateLimit } from "@startup/rate-limit";

const port = 3900;
const app = express();

initPassportJS();
initLogger();
initCORS(app);
initDB();
initProd(app);
initRateLimit(app);


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


// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

initRoutes(app);
swaggerDocs(app,port);

app.listen(port, () => winston.info(`Listening on port ${port}...`));