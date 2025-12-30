import Conversation from "../models/conversation.model.js"
import Friend from "../models/friend.model.js"
import Message from "../models/message.model.js" 
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    const conversations = await Conversation.find({
        participants: userId
    })
    .populate("participants", "username firstName lastName picture")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })

    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
        if (!conv.lastMessage) return { ...conv.toObject(), unreadCount: 0 };

        const unreadCount = await Message.countDocuments({
            conversation: conv._id,
            sender: { $ne: userId }, 
            isRead: false            
        });
        
        return {
            ...conv.toObject(),
            unreadCount
        }
    }));

    res.status(200).json(
        new ApiResponse(200, "Conversations fetched", conversationsWithUnread)
    )
})


export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { otherUserId } = req.params

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
    conversation = await conversation.populate("participants", "username firstName lastName picture")

    res.status(200).json(
        new ApiResponse(200, "Conversation ready", conversation)
    )
})