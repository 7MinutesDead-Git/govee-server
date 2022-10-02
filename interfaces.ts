export enum govee {
    url = "https://developer-api.govee.com/",
    devices = "v1/devices/",
    control = "control"
}

enum h6003SupportedCommands {
    turn = "turn",
    brightness = "brightness",
    color = "color",
    colorTem = "colorTem"
}

export interface goveeCommandRequest {
    device: string,
    model: string,
    cmd: {
        name: string,
        value: string
    }
}

export interface goveeCommandResponse {
    code: number,
    message: string,
    data: {}
}

export interface goveeDevicesResponse {
    code: number,
    message: string,
    data: {
        devices: goveeDevice[]
    }
}

export interface goveeDevice {
    device: string,
    model: string,
    deviceName: string,
    controllable: boolean,
    retrievable: boolean,
    supportCmds: string[],
    properties: {
        colorTem: {
            range: {
                min: number,
                max: number
            }
        }
    }
}

export interface goveeDeviceState {
    device: string,
    model: string,
    properties: [
        { online: boolean },
        { powerState: string },
        { brightness: number },
        { color: { r: number, g: number, b: number } }
    ]
}