import * as dotenv from 'dotenv'
import express from 'express'
import expressWs from 'express-ws'
import { devicesRoutes } from './routes/devices.js'

// ----------------------------------------------------------------
// Initialization
const websocket = expressWs(express())
const app = websocket.app
const wss = websocket.getWss()
dotenv.config()


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
app.ws('/', (ws, req) => {
    console.log("--------------------")
    console.log("Websocket connections: ", wss.clients.size)
    ws.on('open', () => {
        console.log('Websocket opened.')
        setInterval(() => {
            ws.send('keepalive ping')
        }, 10000)
    })

    ws.on('message', (msg: string) => {
        if (msg === "ping") {
            return
        }
        // const data = JSON.parse(msg)
        // console.log(`${new Date().toLocaleString()}: Message received from client ${req.ip}: ${data.type}`)
        const broadcastData = msg
        // Send updates to all other clients.
        for (const client of wss.clients) {
            client.send(broadcastData)
        }
    })

    ws.on('close', (num) => {
        console.log(`Websocket connection ${num} closed.`)
    })
})


// ----------------------------------------------------------------
app.listen(process.env.GOVEE_PORT, () => {
    console.log('Govee server listening on port ', process.env.GOVEE_PORT)
})