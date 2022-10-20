import * as dotenv from 'dotenv'
import express from 'express'
import expressWs from 'express-ws'
import { devicesRoutes } from './routes/devices.js'
import { generateUID } from './utils/helpers.js'

// ----------------------------------------------------------------
// Initialization
const { app } = expressWs(express())
dotenv.config()
const wsClients = {}


// ----------------------------------------------------------------
// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT')
    next()
})
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// ----------------------------------------------------------------
// REST Routes
app.use("/devices", devicesRoutes)

// ----------------------------------------------------------------
// Websocket
app.ws('/ws', (ws, req) => {
    console.log(`Websocket connection established from ${req.ip}.`)
    ws.on('message', (msg) => {
        console.log(msg)
    })
    ws.on('request', (req) => {
        console.log(req)
        console.log(`${new Date().toLocaleString()}: new websocket request from ${req.origin}.`)
        const userID = generateUID()
        const connection = req.accept(null, req.origin)
        wsClients[userID] = req
    })
    ws.on('close', () => {
        console.log(`Websocket connection closed from ${req.ip}.`)
    })
})


// ----------------------------------------------------------------
app.listen(process.env.GOVEE_PORT, () => {
    console.log('Govee server listening on port ', process.env.GOVEE_PORT)
})