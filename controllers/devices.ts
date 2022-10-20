import {govee, goveeDevice, goveeDeviceState} from "../interfaces.js"
import {getConnectedLights, sendLightCommand} from "../utils/lights.js"
import axios from "axios"

const rateLimit = { expiresAt: "" }

export const devicesController = {
    async sendCommand(req, res) {
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
    },
    async getDevices(req, res) {
        console.log(`Initial devices request received at ${req.url} from ${req.ip}.`, req.body)
        const url = `${govee.url}${govee.devices}`
        try {
            const response = await getConnectedLights(url)
            if (response.code === 429) {
                res.status(response.code)
                rateLimit.expiresAt = new Date(Number(response.message) * 1000).toLocaleString()
                console.log("Retry at: ", rateLimit.expiresAt)
                response.rateLimitReset = rateLimit.expiresAt
                res.send(response)
            }
            else {
                const onlineDevices: goveeDevice[] = response.data.devices
                res.send(onlineDevices)
            }
        }
        catch (error) {
            console.error(error)
        }
    },
    async getState(req, res) {
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
    },
    async getRateLimit(req, res, rateLimit) {
        res.send({
            date: rateLimit.expiresAt
        })
    }
}

