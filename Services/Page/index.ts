//@ts-nocheck
import express from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import PageRoutes from "./src/routes/posts";
import { io } from "socket.io-client";
import { responseHandler } from './middlewares/responseHandler';
import morgan from 'morgan';
import winston from "winston"; 
import os from 'os';
import ip from 'ip';
import { rateLimit } from 'express-rate-limit'
require('dotenv').config()


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})

const socket = io("https://socket.xyz.co", {
  transports: ["websocket"],
  upgrade: false
});
socket.on("connect", () => {
  console.log("Socket connected")
})
socket.on("disconnect", () => {
  console.log("Socket disconnected")
})

const app = express();

var corsOption = {
  origin: "*"
}
let serviceEndpoint = process.env.SERVICE_NAME
const PORT = process.env.PORT || 3001;

// Logging implementation
const { combine, timestamp, printf } = winston.format;
// Function to get the system name (can be OS-dependent)
function getSystemName() {
  return require('os').hostname();
}

// Function to get the system IP address
function getSystemIP() {
  return ip.address();
}

// Create a custom log format
const logFormat = printf(({ level, message, timestamp, systemName, systemIP }) => {
  return `${timestamp} [${level.toUpperCase()}] (${systemName} - ${systemIP}): ${message}`;
});


// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info', // Set the log level (options: error, warn, info, verbose, debug, silly)
  format: combine(
    timestamp(),
    winston.format((info) => {
      info.systemName = getSystemName();
      info.systemIP = getSystemIP();
      return info;
    })(), 
    logFormat   
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'service.log' }), // Log to file
  ],
});

// Set up logging using Morgan with the Winston logger
app.use(
  morgan('combined', {
    stream: { write: (message) =>{  
      console.log(message, 'msg data');      
    logger.info(message.trim()) }},
  })
);


// Service Middleware (Application level middlewares only)
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(authenticateToken);

// Apply the rate limiting middleware to all requests.
app.use(limiter)
app.use('/', PageRoutes, responseHandler);


// DB Initialization and server start

mongoose.connect(process.env.DB_URL!, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected')
    app.listen(PORT, () => {
      console.log(`${serviceEndpoint} is running on PORT ${PORT}`);
    })
  })
  .catch((e) => console.log('Something went wrong while connecting DB ', e))

export const socket;


