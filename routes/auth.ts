import express from 'express'
import { authController } from "../controllers/auth.js"
import passport from "passport"

const router = express.Router()

router.post('/', passport.authenticate("local"), authController.login)
router.delete('/', authController.logout)
router.get('/session', authController.getSession)

export { router as authRoutes }
