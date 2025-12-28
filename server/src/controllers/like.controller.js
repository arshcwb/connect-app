import Like from "../models/like.model.js"
import Post from "../models/post.model.js"
import Comment from "../models/comment.model.js"
import Friend from "../models/friend.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import Notification from "../models/notification.model.js"

export const toggleLike = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { targetType, targetId } = req.params

    if (!["post", "comment"].includes(targetType)) {
        throw new ApiError(400, "Invalid target type")
    }

    const normalizedType = targetType.charAt(0).toUpperCase() + targetType.slice(1)

    const Model = normalizedType === "Post" ? Post : Comment

    const target = await Model.findById(targetId)
    if (!target) {
        throw new ApiError(404, `${normalizedType} not found`)
    }

    let post
    if (normalizedType === "Post") {
        post = target
    } else {
        post = await Post.findById(target.post)
        if (!post) {
            throw new ApiError(404, "Parent post not found")
        }
    }

    if (post.visibility === "private") {
        if (post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "This post is private")
        }
    }

    if (post.visibility === "friends") {
        if (post.author.toString() !== userId.toString()) {
            const isFriend = await Friend.exists({
                users: { $all: [userId, post.author] }
            })

            if (!isFriend) {
                throw new ApiError(403, "Only friends can interact with this post")
            }
        }
    }

    const existing = await Like.findOne({
        user: userId,
        targetType: normalizedType,
        targetId
    })

    if (existing) {
        await existing.deleteOne()
        await Model.findByIdAndUpdate(targetId, {
            $inc: { likesCount: -1 }
        })

        return res.status(200).json(
            new ApiResponse(200, "Like removed", null)
        )
    }

    await Like.create({
        user: userId,
        targetType: normalizedType,
        targetId
    })

    await Model.findByIdAndUpdate(targetId, {
        $inc: { likesCount: 1 }
    })

    const receiver = normalizedType === "Post"? 
                    post.author  : target.author

    if (receiver.toString() !== userId.toString()) {
        await Notification.create({
            receiver,
            sender: userId,
            type: "like",
            entityType: normalizedType,
            entityId: targetId
        })
    }

    res.status(201).json(
        new ApiResponse(201, "Liked successfully", null)
    )
})


export const getLikes = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { targetType, targetId } = req.params

    if (!["post", "comment"].includes(targetType)) {
        throw new ApiError(400, "Invalid target type")
    }

    const normalizedType =
        targetType.charAt(0).toUpperCase() + targetType.slice(1)

    const Model = normalizedType === "Post" ? Post : Comment

    const target = await Model.findById(targetId)
    if (!target) {
        throw new ApiError(404, `${normalizedType} not found`)
    }

    let post
    if (normalizedType === "Post") {
        post = target
    } else {
        post = await Post.findById(target.post)
        if (!post) {
            throw new ApiError(404, "Parent post not found")
        }
    }

    if (post.visibility === "private") {
        if (post.author.toString() !== userId.toString()) {
            throw new ApiError(403, "This post is private")
        }
    }

    if (post.visibility === "friends") {
        if (post.author.toString() !== userId.toString()) {
            const isFriend = await Friend.exists({
                users: { $all: [userId, post.author] }
            })

            if (!isFriend) {
                throw new ApiError(403, "Only friends can view likes on this post")
            }
        }
    }

    const likes = await Like.find({
        targetType: normalizedType,
        targetId
    }).populate("user", "username firstName lastName picture")

    res.status(200).json(
        new ApiResponse(200, "Likes fetched", {
            count: likes.length,
            users: likes.map(like => like.user)
        })
    )
})

export const getAllUserLikes = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likes = await Like.find({ user: userId });
    const postIds = likes
        .filter(like => like.targetType === "Post")
        .map(like => like.targetId.toString());

    const commentIds = likes
        .filter(like => like.targetType === "Comment")
        .map(like => like.targetId.toString());

    return res.status(200).json(
        new ApiResponse(200, "User likes fetched", {
            postIds,
            commentIds
        })
    );
});