import User from "../models/user.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import {uploadCloudinary} from "../../utils/uploadCloudinary.js"
import {asyncHandler} from "../../utils/asyncHandler.js"
import {generateTokens} from "../../utils/generateTokens.js"
import {PUBLIC_PROFILE_FIELDS} from "../constants.js"
import {options} from "../constants.js"
import jwt from "jsonwebtoken"
import cloudinary from "cloudinary"
import Friend from "../models/friend.model.js"
import Post from "../models/post.model.js"; 
import Notification from "../models/notification.model.js";

export const register = asyncHandler( async (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        email,
        username,
        password,
        location,
        occupation
    } = req.body


    const pictureLocalPath = req.file?.path

    let picture;
    if(pictureLocalPath) picture = await uploadCloudinary(pictureLocalPath)
    

    
    const newUser = await User.create({
        firstName,
        middleName,
        lastName,
        email,
        username: username.toLowerCase(),
        password,
        picture:{
            url: picture? picture.url: "",
            public_id: picture? picture.public_id: ""
        },
        location,
        occupation,
    })

    
    if(!newUser){
        throw new ApiError(500, "Something went wrong while user registration")
    }
    
    res.status(201).json(
        new ApiResponse(201, "User registered successfully", newUser)
    )
})

export const login = asyncHandler( async (req, res) => {
    const {email, username, password} = req.body

    const user = await User.findOne({$or: [{email}, {username: username?.toLowerCase()}]}).select("+password")
    if(!user) {
        throw new ApiError(404, "User not found. Please register first")
    }
    
    const isPasswordValid = await user.isPasswordValid(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Wrong credentials")
    }
    
    const tokens = await generateTokens(user._id)
    
    const loggedInUser = await User.findById(user._id)

    const apiResponse = new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    })

    const clientOptions = {
        ...options,
        httpOnly: false
    };
    return res.status(200)
    .cookie("accessToken", tokens.accessToken, options)
    .cookie("refreshToken", tokens.refreshToken, options)
    .cookie("loggedIn", true, options)
    .json(apiResponse)

})

export const getProfile = asyncHandler( async (req, res) => {
    const user = req.user
    if(!user) throw new ApiError(404, "User not found")
    const friendsCount = await Friend.countDocuments({
        users: user._id
    })

    res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", {
            user,
            friendsCount
        })
    )
})

export const changeVisibility = asyncHandler( async (req, res) => {
    const userId = req.user._id

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const updatedUser = await User.findByIdAndUpdate(userId,
        {
            $set: {
                profileVisibility: user.profileVisibility==="private"? "public": "private"
            }
        },
        {
            new: true
        }
    )

    res.status(200).json(
        new ApiResponse(200, "Profile Visibility Updated", updatedUser.profileVisibility)
    )
})

export const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username })
        .select(PUBLIC_PROFILE_FIELDS)
        .lean();

    const friendsCount = await Friend.countDocuments({
        users: user._id
    })


    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", {
            user,
            friendsCount
        })
    );
});


export const logout = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )
    const clientOptions = {
        ...options,
        httpOnly: false
    };
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .clearCookie("loggedIn", options)
    .json(
        new ApiResponse(200, "User logged out successfully", null)
    )
})

export const refreshAccessToken = asyncHandler( async (req, res) => {
    const userRefreshToken =  req.cookies?.refreshToken || req.body?.refreshToken

    if(!userRefreshToken) {
        throw new ApiError(401, "Refresh token not found")
    }
    try {
        const decodedToken = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("+refreshToken")
        if(!user) {
            throw new ApiError(401, "Unauthorized session")
        }
        if(user.refreshToken !== userRefreshToken) {
            throw new ApiError(401, "Refresh token expired")
        }

        const {accessToken, refreshToken} = await generateTokens(user._id)
        const apiResponse = new ApiResponse(200, "Access token refreshed successfully", {
            accessToken,
            refreshToken
        })
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(apiResponse)
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

export const changePassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if(!(oldPassword && newPassword && confirmPassword)){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user?._id).select("+password")
    const isPasswordValid = await user.isPasswordValid(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(401, "Wrong credentials, cannot change password")
    }


    user.password = newPassword
    await user.save({validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "Password changed successfully", null)
    )
})


export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const {
        firstName,
        middleName,
        lastName,
        username,
        email,
        location,
        occupation,
    } = req.body || {};

    const updates = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (middleName !== undefined) updates.middleName = middleName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (location !== undefined) updates.location = location;
    if (occupation !== undefined) updates.occupation = occupation;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
    )

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", updatedUser)
    )
})


export const updatePicture = asyncHandler( async (req, res) => {
    const pictureLocalPath = req.file?.path
    if(!pictureLocalPath) {
        throw new ApiError(400, "Profile picture is required")
    }
    
    const picture = await uploadCloudinary(pictureLocalPath)
    if (!picture || !picture.url) {
        throw new ApiError(500, "Picture upload failed");
    }

    if(req.user.picture?.public_id){
        await cloudinary.uploader.destroy(req.user.picture.public_id)
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                picture: {
                    url: picture.url,
                    public_id: picture.public_id
                }
            }
        },
        {new: true}
    )
    return res.status(200).json(
        new ApiResponse(200, "User picture updated successfully", user)
    )
})

export const removePicture = asyncHandler( async (req, res) => {
    await cloudinary.uploader.destroy(req.user.picture.public_id)

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                picture: {
                    url: "",
                    public_id: ""
                }
            }
        },
        {new: true}
    )

    return res.status(200).json(
        new ApiResponse(200, "User picture removed successfully", user)
    )
})

export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.params

    if (!query || query.trim().length < 2) {
        throw new ApiError(400, "Search query too short")
    }

    const regex = new RegExp(query.trim(), "i")

    const users = await User.find({
        $or: [
            { username: regex },
            { firstName: regex },
            { middleName: regex },
            { lastName: regex }
        ]
    })
        .select("username firstName middleName lastName picture")
        .limit(10)

    res.status(200).json(
        new ApiResponse(200, "Users fetched", users)
    )
})


export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required to delete account");
    }

    const user = await User.findById(userId).select("+password");
    
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    await Post.deleteMany({ author: userId });
    await Friend.deleteMany({ users: userId });
    await Notification.deleteMany({ receiver: userId });

    await User.findByIdAndDelete(userId);

    const clientOptions = {
        ...options,
        httpOnly: false
    };
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .clearCookie("loggedIn", options)
        .json(new ApiResponse(200, "Account deleted successfully"));
})



