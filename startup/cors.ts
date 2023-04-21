import cors from "cors";
import { Express } from "express";

export function initCORS(app:Express){
    app.use(
        cors({
            origin: [`https://localhost:3900`, `http://localhost:3900`, `http://localhost:3900`],
            methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
            credentials: true, // enable set cookie  
        })
    )
}