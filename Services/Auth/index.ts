
//@ts-nocheck
import express from 'express';
import cors from 'cors';
import AuthRoutes from "./src/routes/auth";
import session from "express-session";
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})
require('dotenv').config()
const app = express();
const cache = require('node-cache');
const morgan = require('morgan');
const winston = require("winston"); 
const os = require('os');
const ip = require('ip');
const fs = require('fs');
require('isomorphic-fetch');
var corsOption = {
  // origin: process.env.url || "http://localhost:8080"
  origin: "*" // BEWARE
};
let serviceEndpoint = process.env.SERVICE_NAME
const PORT = process.env.PORT || 4300;
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
const logFormat = printf(({ level, message, timestamp, systemName, systemIP, }) => { //...metadata , ${JSON.stringify(metadata)}
  return `${timestamp} [${level.toUpperCase()}] (${systemName} - ${systemIP}): ${message}`;
});

// Create initial transports (Console and File)
const consoleTransport = new winston.transports.Console();
const fileTransport = new winston.transports.File({ filename: 'service.log' });

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    winston.format((info) => {
      info.systemName = getSystemName();
      info.systemIP = getSystemIP();
      return info;
    })(),
    logFormat   
  ),
  transports: [consoleTransport, fileTransport],
});

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


// Service Middleware (Application level middlewares only)
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.set('trust proxy', 1) // trust first proxy - If LB is using proxy this is a must
app.use(session({
  secret: '1234abcd',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: false,
    secure: true,
    sameSite: false,
    maxAge: 600000 // Time is in miliseconds},
  // genid: (req: any) => {
  //   return v4()
  // }
  }
}))
app.use('/', AuthRoutes);
//set express view engine
app.set("view engine", "ejs");

// DB Initialization and server start

mongoose.connect(process.env.DB_URL!, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log('Database connected')
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    })
  })
  .catch((e) => console.log('Something went wrong while connecting DB ', e))

export default app


