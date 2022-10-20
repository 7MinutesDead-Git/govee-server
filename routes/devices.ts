import express from 'express'
import { devicesController } from '../controllers/devices.js'

const router = express.Router()

router.get('/', devicesController.getDevices)
router.put('/', devicesController.sendCommand)
router.get('/state', devicesController.getState)
router.get('/rate-limit', devicesController.getRateLimit)

export { router as devicesRoutes }