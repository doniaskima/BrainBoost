import mongoose from "mongoose";
import winston from "winston";

// Connect to DB from env variable url, create instance
export function initDB() {
  const db = process.env.MONGO_URI || "mongodb+srv://Elearning:Elearning@cluster0.smqolzo.mongodb.net/?retryWrites=true&w=majority";

  mongoose
    .connect(db)
    .then(() => winston.info(`Connected to ${db}...`))
    .catch((error) => winston.error(error));
}
