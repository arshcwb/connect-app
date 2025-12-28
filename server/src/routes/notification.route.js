import { Router } from "express"
import { jwtAuth } from "../middlewares/jwtAuth.middleware.js"
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    deleteAllNotifications,
    deleteNotification
} from "../controllers/notification.controller.js"

const router = Router()

router.route("/all").get(
    jwtAuth,
    getNotifications
)

router.route("/read/:id").post(
    jwtAuth,
    markNotificationRead
)
router.route("/read/all").post(
    jwtAuth,
    markAllNotificationsRead
)
router.route("/count/unread").get(
    jwtAuth,
    getUnreadNotificationCount
)

router.route("/:id").delete(
    jwtAuth,
    deleteNotification
)
router.route("/all").delete(
    jwtAuth,
    deleteAllNotifications
)

export default router
