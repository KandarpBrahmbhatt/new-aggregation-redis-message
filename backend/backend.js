import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import coonectDB from "./config/db.js";
import aggregateRouter from "./routes/aggregate.routes.js";
import cors from "cors"
import newRouter from "./routes/new.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", // React app
        credentials: true
    })
);
app.use("/api/new", aggregateRouter);
app.use("/new", newRouter)
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`server is started ${port}`)
    coonectDB()
});