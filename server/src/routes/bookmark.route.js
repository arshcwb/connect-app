import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    addBookmark,
    removeBookmark,
    getBookmarks
} from "../controllers/bookmark.controller.js"

const router = Router()


router.route("/get").get(
    jwtAuth,
    getBookmarks
)

router.route("/add/:postId").post(
    jwtAuth,
    addBookmark
)


router.route("/delete/:postId").delete(
    jwtAuth,
    removeBookmark
)

export default router
