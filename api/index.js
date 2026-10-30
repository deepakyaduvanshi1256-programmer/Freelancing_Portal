import 'dotenv/config'
import express from  'express'
import cors from 'cors'
import mongoose from 'mongoose';
import http from 'http';
import router from './router/router.js';
import { initSocketServer } from './socketServer.js';
import dbconnect from './config/db.js';
const app = express()
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use(router)
dbconnect()
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
initSocketServer(server);
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})