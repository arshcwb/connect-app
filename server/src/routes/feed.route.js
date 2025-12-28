import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    getYourInterestFeed
} from "../controllers/feed.controller.js"

const router = Router()

router.get("/my", jwtAuth, getYourInterestFeed)

export default router
