import ApiError from "../../../utils/ApiError.js"

const validateLogin = (req, res, next) => {
    const {
        email,
        username,
        password
    } = req.body

    if (!(email || username)) {
        throw new ApiError(400, "Email or Username is required")
    }

    if (email && !email.includes("@")) {
        throw new ApiError(400, "Email must be a valid email")
    }
    if (username && username.length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters long")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    next()
}

export default validateLogin
