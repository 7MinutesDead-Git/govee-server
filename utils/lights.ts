import { goveeCommandRequest, goveeDevicesResponse } from "../interfaces"
import axios from "axios"

export async function getConnectedLights(url: string): Promise<goveeDevicesResponse> {
    try {
        const response = await axios.get<goveeDevicesResponse>(url, {
            headers: {'Govee-API-Key': process.env.GOVEE_KEY}
        })
        return response.data
    }
    catch (error) {
        const responseObject: goveeDevicesResponse = {
            code: 500,
            message: error.message,
            data: {
                devices: []
            }
        }
        console.log("---------------------------")
        console.log(error.response.headers['x-ratelimit-reset'])
        console.log(error.response.headers)
        if (error.code === "ERR_BAD_REQUEST") {
            responseObject.code = 429
            responseObject.message = error.response.headers["x-ratelimit-reset"]
            return responseObject
        }
        else {
            console.log(error)
            return responseObject
        }
    }
}

export async function sendLightCommand(url: string, command: goveeCommandRequest) {
    const response = await axios.put(url, command, {
        headers: {'Govee-API-Key': process.env.GOVEE_KEY}
    })
    return response
}
