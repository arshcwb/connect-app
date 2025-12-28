import {Router} from "express"
import {jwtAuth} from "../middlewares/jwtAuth.middleware.js"
import {
    getRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    getFriends,
    removeFriend,
    getRecommendation,
    getSentRequests
} from "../controllers/friend.controller.js"

const router = Router()

router.route("/requests/pending").get(
    jwtAuth,
    getRequests
)
router.route("/requests/sent").get(
    jwtAuth,
    getSentRequests
);
router.route("/requests/send/:friendId").post(
    jwtAuth,
    sendRequest
)
router.route("/requests/accept/:fromId").post(
    jwtAuth,
    acceptRequest
)
router.route("/requests/reject/:fromId").post(
    jwtAuth,
    rejectRequest
)
router.route("/all").get(
    jwtAuth,
    getFriends
)
router.route("/remove/:friendId").post(
    jwtAuth,
    removeFriend
)

router.route("/recommended").get(
    jwtAuth,
    getRecommendation
)

export default router