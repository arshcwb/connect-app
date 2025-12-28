import Comment from "../models/comment.model.js"
import Post from "../models/post.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import Notification from "../models/notification.model.js"

export const addComment = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { postId, content, parentComment } = req.body

    if (!userId) {
        throw new ApiError(401, "User is unauthorized")
    }

    const post = await Post.findById(postId)
    if (!post) throw new ApiError(404, "Post not found")

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty")
    }

    if (content.length > 4000) {
        throw new ApiError(400, "Comment too long")
    }

    let parent = null
    if (parentComment) {
        parent = await Comment.findById(parentComment)
        if (!parent || parent.post.toString() !== postId) {
            throw new ApiError(400, "Invalid parent comment")
        }
    }

    const comment = await Comment.create({
        post: postId,
        author: userId,
        content,
        parentComment: parentComment || null
    })

    await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: 1 }
    })

    if (parent) {
        if (parent.author.toString() !== userId.toString()) {
            await Notification.create({
                receiver: parent.author,
                sender: userId,
                type: "reply",
                entityType: "Comment",
                entityId: parent._id
            })
        }
    } else {
        if (post.author.toString() !== userId.toString()) {
            await Notification.create({
                receiver: post.author,
                sender: userId,
                type: "comment",
                entityType: "Post",
                entityId: post._id
            })
        }
    }

    res.status(201).json(
        new ApiResponse(201, "Comment added", comment)
    )
})

export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id
    if(!userId){
        throw new ApiError(401, "User is unauthorized")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404, "Comment not found")

    if (comment.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Not allowed")
    }

    comment.isDeleted = true
    comment.content = "This comment was deleted"
    await comment.save()

    res.status(200).json(
        new ApiResponse(200, "Comment deleted", null)
    )
})

export const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params

    const comments = await Comment.find({ post: postId })
        .sort({ createdAt: 1 })
        .populate("author", "username picture")

    res.status(200).json(
        new ApiResponse(200, "Comments fetched", comments)
    )
})
