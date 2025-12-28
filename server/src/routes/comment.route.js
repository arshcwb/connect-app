import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    addComment,
    deleteComment,
    getComments
} from "../controllers/comment.controller.js"

const router = Router()

router.route("/get/:postId").get(
    getComments
)

router.route("/add").post(
    jwtAuth,
    addComment
)

router.route("/delete/:commentId").delete(
    jwtAuth,
    deleteComment
)

export default router
