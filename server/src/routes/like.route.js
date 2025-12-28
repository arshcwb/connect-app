import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    toggleLike,
    getLikes,
    getAllUserLikes
} from "../controllers/like.controller.js"

const router = Router()

router.route("/toggle/:targetType/:targetId").post(
    jwtAuth,
    toggleLike
)

router.route("/get/:targetType/:targetId").get(
    jwtAuth,
    getLikes
)
router.route("/all").get(
    jwtAuth,
    getAllUserLikes
)

export default router
