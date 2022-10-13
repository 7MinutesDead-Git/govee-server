import * as dotenv from 'dotenv'
import express from 'express'
import axios from 'axios'

import {
    govee,
    goveeCommandRequest,
    goveeDevice,
    goveeDevicesResponse,
    goveeDeviceState
} from './interfaces.js'

dotenv.config()
const app = express()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT')
    next()
})

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


async function getConnectedLights(url: string) {
    return await axios.get<goveeDevicesResponse>(url, {
        headers: {'Govee-API-Key': process.env.GOVEE_KEY}
    })
}

async function sendLightCommand(url: string, command: goveeCommandRequest) {
    const response = await axios.put(url, command, {
        headers: {'Govee-API-Key': process.env.GOVEE_KEY}
    })
    return response
}

// Endpoint to get the status of all available devices.
app.get('/devices', async (req, res) => {
    console.log(`Initial devices request received at ${req.url} from ${req.ip}.`, req.body)
    const url = `${govee.url}${govee.devices}`
    try {
        const response = await getConnectedLights(url)
        if (response.status === 429) {
            console.error(response.data)
            res.send(response.data)
        }
        console.log(response.data.data.devices)
        const onlineDevices: goveeDevice[] = response.data.data.devices
        res.send(onlineDevices)
    }
    catch (error) {
        console.error(error)
    }
})

app.get('/devices/state', async (req, res) => {
    // "state?device=etc&model=etc"
    // Request Query Parameters:
    // device: 06:7A:A4:C1:38:5A:2A:8D
    // model: H6148
    console.log(`Request received from ${req.ip} for device state.`)
    const url = `${govee.url}${govee.devices}state?device=${req.query.device}&model=${req.query.model}`
    console.log(url)
    try {
        const response = await axios.get(url, {
            headers: {'Govee-API-Key': process.env.GOVEE_KEY},
            params: {
                device: req.body.device,
                model: req.body.model
            }
        })
        const deviceState: goveeDeviceState = response.data
        res.send(deviceState)
    }
    catch (error) {
        console.error(error)
    }
})

app.put('/devices', async (req, res) => {
    console.log(`PUT request received from ${req.ip}. Request body: `, req.body)
    const url = `${govee.url}${govee.devices}${govee.control}`
    try {
        const response = await sendLightCommand(url, req.body)
        if (response.status === 429) {
            res.status(429).send(response)
        }
        else {
            console.log("Command sent successfully!", response.data)
            res.send(response.data)
        }
    }
    catch (error) {
        console.error(error.response.data)
        res.status(429).send(error.response.data)
    }
})


app.listen(process.env.GOVEE_PORT, () => {
    console.log('Govee server listening on port ', process.env.GOVEE_PORT)
})