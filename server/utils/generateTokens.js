import User from "../src/models/user.model.js"
import ApiError from "./ApiError.js"

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId).select("+refreshToken")
        if (!user) throw new ApiError(404, "User not found")

        const accessToken = await user.generateAccessToken()

        const refreshToken = await user.generateRefreshToken()
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })



        return { accessToken, refreshToken }

    }
    catch (error) {
        throw new ApiError(500, "Token generation failed")
    }
}

export {generateTokens}