import ApiError from "../../../utils/ApiError.js"
import { asyncHandler } from "../../../utils/asyncHandler.js"

const checkPassword = (password) => {
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
}
const validateChangePassword = asyncHandler(async (req, res, next) => {
    const {
        oldPassword,
        newPassword,
        confirmPassword
    } = req.body

    if(!oldPassword || !newPassword || !confirmPassword){
        throw new ApiError(400, "All fields are required")

    }
    checkPassword(newPassword)
    
    if(oldPassword === newPassword){
        throw new ApiError(400, "New password must be different from old password")
    }
    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New Password doesn't match")
    }

    next()
})

export default validateChangePassword
