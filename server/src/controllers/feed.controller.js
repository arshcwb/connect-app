import Post from "../models/post.model.js"
import Friend from "../models/friend.model.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const getYourInterestFeed = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const page = Number(req.query.page) || 0
    const limit = 10
    const skip = page * limit

    const friendships = await Friend.find({ users: userId })
        .select("users")

    const friendIds = friendships.map(f =>
        f.users.find(u => u.toString() !== userId.toString())
    )

    const posts = await Post.find({
        $or: [
            { author: userId },
            { visibility: "public" },
            {
                visibility: "friends",
                author: { $in: friendIds }
            }
        ]
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username firstName lastName picture")

    res.status(200).json(
        new ApiResponse(200, "Feed fetched", {
            page,
            count: posts.length,
            posts
        })
    )
})
