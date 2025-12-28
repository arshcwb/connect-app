import Bookmark from "../models/bookmark.model.js"
import Post from "../models/post.model.js"
import Friend from "../models/friend.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

export const addBookmark = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { postId } = req.params

    const post = await Post.findById(postId)
    if (!post) throw new ApiError(404, "Post not found")

    if (post.visibility === "private") {
        if (post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "Cannot bookmark a private post")
        }
    }

    if (post.visibility === "friends") {
        if (post.author.toString() !== userId.toString()) {
            const isFriend = await Friend.exists({
                users: { $all: [userId, post.author] }
            })

            if (!isFriend) {
                throw new ApiError(403, "Only friends can bookmark this post")
            }
        }
    }

    const alreadyBookmarked = await Bookmark.exists({
        user: userId,
        post: postId
    })

    if (alreadyBookmarked) {
        return res.status(200).json(
            new ApiResponse(200, "Post already bookmarked", null)
        )
    }

    await Bookmark.create({ user: userId, post: postId })

    res.status(201).json(
        new ApiResponse(201, "Post bookmarked", null)
    )
})

export const removeBookmark = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { postId } = req.params

    await Bookmark.deleteOne({ user: userId, post: postId })

    res.status(200).json(
        new ApiResponse(200, "Bookmark removed", null)
    )
})

export const getBookmarks = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const bookmarks = await Bookmark.find({ user: userId })
        .populate({
            path: "post",
            match: { visibility: { $in: ["public", "friends", "private"] } }
        })

    res.status(200).json(
        new ApiResponse(
            200,
            "Bookmarks fetched",
            bookmarks.map(b => b.post).filter(Boolean)
        )
    )
})
