import ApiError from "../../../utils/ApiError.js"

const validateRegister = (req, res,next) => {

    const {
        firstName,
        middleName,
        lastName,
        email,
        username,
        password
    } = req.body

    if (!firstName) {
        throw new ApiError(400, "First name is required")
    }

    if (firstName.length > 50) {
        throw new ApiError(400, "First name must be less than 50 characters")
    }

    if (middleName && middleName.length > 50) {
        throw new ApiError(400, "Middle name must be less than 50 characters")
    }

    if (lastName && lastName.length > 50) {
        throw new ApiError(400, "Last name must be less than 50 characters")
    }

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Email must be a valid email")
    }

    if (!username) {
        throw new ApiError(400, "Username is required")
    }

    if (username.length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters long")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long")
    }

    let hasLetter = false
    let hasNumber = false
    let hasSymbol = false

    for (let char of password) {
        if (
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z")
        ) {
            hasLetter = true
        } else if (char >= "0" && char <= "9") {
            hasNumber = true
        } else {
            hasSymbol = true
        }
    }

    if (!hasLetter) {
        throw new ApiError(400, "Password must contain at least one letter")
    }

    if (!hasNumber) {
        throw new ApiError(400, "Password must contain at least one number")
    }

    if (!hasSymbol) {
        throw new ApiError(400, "Password must contain at least one symbol")
    }
    next()
}

export default validateRegister
