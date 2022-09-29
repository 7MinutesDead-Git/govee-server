import * as dotenv from 'dotenv'
import express from 'express'
import axios from 'axios'

import {govee, goveeCommandRequest, goveeCommandResponse, goveeDevice, goveeDevicesResponse} from './interfaces.js'

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
    const url = `${govee.url}${govee.devices}`
    try {
        const response = await getConnectedLights(url)
        if (response.status === 429) {
            console.error(response.data)
            res.send(response.data)
        }
        const onlineDevices: goveeDevice[] = response.data.data.devices
        res.send(onlineDevices)
    }
    catch (error) {
        console.error(error)
    }
})

app.put('/devices', async (req, res) => {
    const url = `${govee.url}${govee.devices}${govee.control}`
    try {
        const response = await sendLightCommand(url, req.body)
        if (response.status === 429) {
            res.send(response.data)
        }
        else {
            console.log("Command sent successfully!", response.data)
            res.send(response.data)
        }
    }
    catch (error) {
        console.error(error.response.data)
        res.send(error.response.data)
    }
})


app.listen(3001, () => {
    console.log('Server listening on port 3001')
})