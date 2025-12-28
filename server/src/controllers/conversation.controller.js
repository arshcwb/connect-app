import Conversation from "../models/conversation.model.js"
import Friend from "../models/friend.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if(!userId){
        throw new ApiError(401, "User is unauthorized")
    }

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate("participants", "username picture")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })

    const result = conversations.map(c => ({
        _id: c._id,
        user: c.participants.find(p => p._id.toString() !== userId.toString()),
        lastMessage: c.lastMessage
    }))

    res.status(200).json(
        new ApiResponse(200, "Conversations fetched", result)
    )
})


export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { otherUserId } = req.params
    if(!userId){
        throw new ApiError(401, "User is unauthorized")
    }
    if (userId.toString() === otherUserId) {
        throw new ApiError(400, "You cannot chat with yourself")
    }
    
    const isFriend = await Friend.exists({
        users: { $all: [userId, otherUserId] }
    })

    if (!isFriend) {
        throw new ApiError(403, "You can only message friends")
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId] }
    })

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, otherUserId]
        })
    }

    res.status(200).json(
        new ApiResponse(200, "Conversation ready", conversation)
    )
})
