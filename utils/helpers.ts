export function generateUID() {
    const randomNum = Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12))
    return Date.now().toString(36) + randomNum.toString(36)
}