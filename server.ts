import * as dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import expressWs from 'express-ws'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'

import passport from 'passport'
import passportLocal from 'passport-local'
import MongoStore from 'connect-mongo'
import morgan from 'morgan'
import bcrypt from 'bcryptjs'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import hpp from 'hpp'

import User from './models/User.js'
import { DatabaseUserInterface, UserInterface } from './interfaces'
import { devicesRoutes } from './routes/devices.js'
import { authRoutes } from './routes/auth.js'

// ----------------------------------------------------------------
// Initialization
const websocket = expressWs(express())
const app = websocket.app
const wss = websocket.getWss()
dotenv.config()
const LocalStrategy = passportLocal.Strategy
const url = process.env.LOCAL_URL || process.env.PROD_URL

// ----------------------------------------------------------------
// Database
mongoose.connect(process.env.MONGO_URI, (err) => {
    if (err) {
        console.error(err)
        return
    }
    console.log("Connected to database.")
})

// ----------------------------------------------------------------
// Middleware
app.use(cors({
    origin: url,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Credentials"],
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Security configuration
app.use(helmet())
app.use(hpp())
// Cookie configuration
app.use(cookieParser())
app.use(session({
    // Name of the cookie
    name: 'govee-session',
    // String that signs and verifies cookie values
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },  // 1 day
    resave: false,
    saveUninitialized: true
}))

// https://plainenglish.io/blog/how-to-send-cookies-from-express-to-a-front-end-application-in-production-9273a4f3ce72
app.set('trust proxy', 1)

app.use(passport.initialize())
app.use(passport.session())

// Rate limiting clients.
const refreshRateLimiter = rateLimit({
    windowMs: 10 * 1000,    // 10 seconds
    max: 50,                // Limit each IP to x requests per `window`
    standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
})
app.use('/', refreshRateLimiter)

// ----------------------------------------------------------------
// Passport
passport.use(new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err, user: DatabaseUserInterface) => {
        if (err) throw err
        if (!user) return done(null, false)

        bcrypt.compare(password, user.password, (err, result: boolean) => {
            if (err) throw err
            if (result === true) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
    })
}))

passport.serializeUser((user: DatabaseUserInterface, cb) => {
    cb(null, user._id)
})

passport.deserializeUser((id: string, cb) => {
    User.findOne({ _id: id }, (err, user: DatabaseUserInterface) => {
        const userInformation: UserInterface = {
            username: user.username,
            isAdmin: user.isAdmin,
            id: user._id
        }
        cb(err, userInformation)
    })
})

// ----------------------------------------------------------------
// Logging
app.enable("trust proxy")
const logger = morgan(':method :url :status :res[content-length] - :response-time ms')
app.use(logger)


// ----------------------------------------------------------------
// REST Routes
app.use("/devices", devicesRoutes)
app.use("/auth", authRoutes)

// ----------------------------------------------------------------
// Websocket
app.ws('/', (ws, req) => {
    // Prevent cross-origin attacks by first verifying the origin of the request.
    // There's nothing sensitive in the ws, but preventing malicious spam would be nice.
    if (req.headers.origin !== url) {
        console.log("Invalid websocket origin from: ", req.headers.origin)
        ws.terminate()
        return
    }
    console.log("Websocket connections: ", wss.clients.size)

    ws.on('message', (msg: string) => {
        if (msg === "pong") {
            return
        }
        if (msg === "ping") {
            ws.send("pong")
            return
        }
        // Send updates to all other clients.
        for (const client of wss.clients) {
            client.send(msg)
        }
    })

    ws.on('close', (num) => {
        console.log(`Websocket connection ${num} closed.`)
    })
    // To keep idle connections alive so that host proxies don't close them.
    setInterval(() => {
        ws.send("ping")
    }, 9001)
})


// ----------------------------------------------------------------
// Start
app.listen(process.env.GOVEE_PORT, () => {
    console.log('Govee server listening on port', process.env.GOVEE_PORT)
})