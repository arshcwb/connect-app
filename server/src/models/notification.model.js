import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: {
        type: String,
        enum: [
            "like",
            "comment",
            "reply",
            "friend_request",
            "friend_accept"
        ],
        required: true
    },

    entityType: {
        type: String,
        enum: ["Post", "Comment"]
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },

    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

notificationSchema.index({ receiver: 1, createdAt: -1 })
notificationSchema.index({ receiver: 1, isRead: 1 })


export default mongoose.model("Notification", notificationSchema)