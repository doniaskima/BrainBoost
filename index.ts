import winston from "winston";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import express from "express";

import { initProd } from "@startup/prod";
import { initDB } from "@startup/db";
import { initCORS } from "@startup/cors";
import { initLogger } from "@startup/logging";
import { initPassportJS } from "@startup/passport";
 
import { initRateLimit } from "@startup/rate-limit";

const port = process.env.PORT || 3900;
const app = express();


initLogger();
initCORS(app);
initDB();

 


// Create session
app.use(
    session({
      // Used to compute a hash
      secret: process.env.SESSION_KEY!,
      resave: false,
      saveUninitialized: false,
      // cookie: { secure: true } when using HTTPS
      // Store session on DB
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI ,
      }),
    })
  );
  
  // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.use(passport.initialize());

  
 
  
  app.listen(port, () => winston.info(`Listening on port ${port}...`));
  


