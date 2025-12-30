import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const getMessages = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { conversationId } = req.params

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
        throw new ApiError(404, "Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        id => id.toString() === userId.toString()
    )

    if (!isParticipant) {
        throw new ApiError(403, "Access denied")
    }

    await Message.updateMany(
        { 
            conversation: conversationId, 
            sender: { $ne: userId }, 
            isRead: false 
        },
        { $set: { isRead: true } }
    );

    const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .populate("sender", "username firstName lastName picture")

    res.status(200).json(
        new ApiResponse(200, "Messages fetched", messages)
    )
})


export const sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { conversationId, content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Message cannot be empty")
    }

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
        throw new ApiError(404, "Conversation not found")
    }

    const isParticipant = conversation.participants.some(
        id => id.toString() === userId.toString()
    )

    if (!isParticipant) {
        throw new ApiError(403, "You are not part of this conversation")
    }

    let message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content
    })

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id
    })

    message = await message.populate("sender", "username firstName lastName picture")

    res.status(201).json(
        new ApiResponse(201, "Message sent", message)
    )
})