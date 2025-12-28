import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: true,
            validate: v => v.length >= 2
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        }
    },
    { timestamps: true }
)

conversationSchema.index(
    {participants: 1},
    {unique: true}
)

export default mongoose.model("Conversation", conversationSchema)