import Notification from "../models/notification.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const notifications = await Notification.find({ receiver: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("sender", "username firstName lastName picture")

    res.status(200).json(
        new ApiResponse(200, "Notifications fetched", notifications)
    )
})

export const markNotificationRead = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    const notification = await Notification.findOneAndUpdate(
        { _id: id, receiver: userId },
        { isRead: true },
        { new: true }
    )

    if (!notification) {
        throw new ApiError(404, "Notification not found")
    }

    res.status(200).json(
        new ApiResponse(200, "Notification marked as read", notification)
    )
})

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id

    await Notification.updateMany(
        { receiver: userId, isRead: false },
        { isRead: true }
    )

    res.status(200).json(
        new ApiResponse(200, "All notifications marked as read", null)
    )
})

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const count = await Notification.countDocuments({
        receiver: userId,
        isRead: false
    })

    res.status(200).json(
        new ApiResponse(200, "Unread notifications count fetched", { count })
    )
})


export const deleteAllNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id

    await Notification.deleteMany({ receiver: userId })

    res.status(200).json(
        new ApiResponse(200, "All notifications cleared successfully", null)
    )
})

export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    const notification = await Notification.findOneAndDelete({
        _id: id,
        receiver: userId
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found or already deleted")
    }

    res.status(200).json(
        new ApiResponse(200, "Notification deleted successfully", null)
    )
})