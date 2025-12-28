import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    createPost,
    deletePost,
    getAllPosts,
    getPost,
    getPostCount
} from "../controllers/post.controller.js"
import { uploadMulter } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/create").post(
  jwtAuth,
  uploadMulter.array("media", 10),
  createPost
)

router.route("/delete/:postId").delete(
    jwtAuth, 
    deletePost
)

router.route("/all/:userId").get(
    jwtAuth, 
    getAllPosts
)

router.route("/:postId").get(
    jwtAuth, 
    getPost
)

router.route("/count/:userId").get(
    jwtAuth, 
    getPostCount
)

export default router
