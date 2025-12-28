import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    getConversations,
    getOrCreateConversation
} from "../controllers/conversation.controller.js"

const router = Router()

router.route("/c/get-all").get(
    jwtAuth,
    getConversations
)

router.route("/c/:otherUserId").get(
    jwtAuth,
    getOrCreateConversation
)

export default router
