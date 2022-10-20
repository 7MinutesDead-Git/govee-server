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
            console.error(error.response)
            res.status(429).send(error.response)
        }
    },
    async getDevices(req, res) {
        console.log(`Initial devices request received: URL "${req.url}" from IP ${req.ip}`)
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
            console.error(error.code)
            if (error.code === "ETIMEDOUT") {
                res.status(408).send(error)
            }
        }
    },
    async getState(req, res) {
        // "state?device=etc&model=etc"
        // Request Query Parameters:
        // device: 06:7A:A4:C1:38:5A:2A:8D
        // model: H6148
        const url = `${govee.url}${govee.devices}state?device=${req.query.device}&model=${req.query.model}`
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

