import {Router} from "express"
import {uploadMulter} from "../middlewares/multer.middleware.js"
import validateRegister from "../middlewares/validations/validateRegister.middleware.js"
import validateLogin from "../middlewares/validations/validateLogin.middleware.js"
import validateChangePassword from "../middlewares/validations/validateChangePassword.middleware.js"
import validateUpdateProfile from "../middlewares/validations/validateUpdateProfile.middleware.js"
import {jwtAuth} from "../middlewares/jwtAuth.middleware.js"
import {
    register,
    login,
    getProfile,
    changeVisibility,
    getUserProfile,
    logout,
    refreshAccessToken,
    changePassword,
    updateProfile,
    updatePicture,
    removePicture,
    searchUsers,
    deleteUser
} from "../controllers/user.controller.js"

const router = Router()

// --- 1. Public Routes ---
router.route("/register").post(
    uploadMulter.single("picture"),
    validateRegister,
    register
)
router.route("/login").post(
    uploadMulter.single("picture"),
    validateLogin,
    login
)
router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/me").get(
    jwtAuth,
    getProfile
)
router.route("/logout").post(
    jwtAuth,
    logout
)
router.route("/change-visibility").post(
    jwtAuth,
    changeVisibility
)
router.route("/change-password").post(
    jwtAuth,
    validateChangePassword,
    changePassword
)
router.route("/update-picture").patch(
    uploadMulter.single("picture"),
    jwtAuth,
    updatePicture
)
router.route("/update-profile").patch(
    jwtAuth,
    validateUpdateProfile,
    updateProfile
)
router.route("/remove-picture").post(
    jwtAuth,
    removePicture
)
router.route("/search/:query").get(
    searchUsers
)

router.route("/delete").post(
    jwtAuth,
    deleteUser
)

router.route("/:username").get(
    jwtAuth,
    getUserProfile
)

export default router