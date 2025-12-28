import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    getMessages,
    sendMessage
} from "../controllers/message.controller.js"

const router = Router()

router.route("/get/:conversationId").get(
    jwtAuth,
    getMessages
)

router.route("/send").post(
    jwtAuth,
    sendMessage
)

export default router
