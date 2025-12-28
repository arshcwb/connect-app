import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Friend from "../models/friend.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { uploadCloudinary } from "../../utils/uploadCloudinary.js"
import {v2 as cloudinary} from "cloudinary"
export const createPost = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { content, visibility } = req.body;

    let media = [];

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadResult = await uploadCloudinary(file.path);

            media.push({
                url: uploadResult.url,
                public_id: uploadResult.public_id,
                type: file.mimetype.startsWith("video") ? "video" : "image",
            })
        }

    }

    if (!content && media.length === 0) {
        throw new ApiError(400, "Either text or media must be provided");
    }

    const post = await Post.create({
        author: userId,
        content,
        media,
        visibility,
    });

    res.status(201).json(
        new ApiResponse(201, "Post created successfully", post)
    );
});


export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params
  const userId = req.user._id

    if(!userId){
        throw new ApiError(401, "User is unauthorized")
    }
    if(!postId){
        throw new ApiError(400, "Post doesn't exist")
    }

    const post = await Post.findById(postId)
    if (!post) throw new ApiError(404, "Post not found")

    if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Not allowed to delete this post")
    }

    if (post.media && post.media.length > 0) {
        for (const media of post.media) {
            await cloudinary.uploader.destroy(media.public_id, {
            resource_type: media.type === "video" ? "video" : "image",
            });
        }
    }
    
    await post.deleteOne()

    res.status(200).json(
        new ApiResponse(200, "Post deleted", null)
    )
})

export const getAllPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const viewerId = req.user?._id
    
    const authorFields = "username firstName lastName picture" 

    const user = await User.findById(userId)
        .select("profileVisibility")
        .lean()

    if (!user) throw new ApiError(404, "User not found")

    if (viewerId?.toString() === userId) {
        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate("author", authorFields)

        return res.status(200).json(
            new ApiResponse(200, "Posts fetched", posts)
        )
    }

    if (user.profileVisibility === "private") {
        if (!viewerId) throw new ApiError(403, "Private profile")

        const isFriend = await Friend.exists({
            users: { $all: [viewerId, userId] }
        })

        if (!isFriend) {
            throw new ApiError(403, "Private profile")
        }
    }

    const posts = await Post.find({
        author: userId,
        visibility: { $in: ["public", "friends"] }
    })
    .sort({ createdAt: -1 })
    .populate("author", authorFields)

    res.status(200).json(
        new ApiResponse(200, "Posts fetched", posts)
    )
})

export const getPost = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const viewerId = req.user?._id

    const post = await Post.findById(postId)
        .populate("author", "username firstName lastName picture profileVisibility")
        .lean()

    if (!post) {
        throw new ApiError(404, "Post not found")
    }

    const authorId = post.author._id.toString()

    if (viewerId?.toString() === authorId) {
        return res.status(200).json(
        new ApiResponse(200, "Post fetched", post)
        )
    }

    if (post.author.profileVisibility === "private") {
        if (!viewerId) {
            throw new ApiError(403, "Private profile")
        }

        const isFriend = await Friend.exists({
            users: { $all: [viewerId, authorId] }
        })

        if (!isFriend) {
            throw new ApiError(403, "Private profile")
        }
    }

    if (post.visibility === "private") {
        throw new ApiError(403, "This post is private")
    }

    if (post.visibility === "friends") {
        if (!viewerId) {
            throw new ApiError(403, "Friends-only post")
        }

        const isFriend = await Friend.exists({
            users: { $all: [viewerId, authorId] }
        })

        if (!isFriend) {
            throw new ApiError(403, "Friends-only post")
        }
    }

    res.status(200).json(
        new ApiResponse(200, "Post fetched", post)
    )
})

export const getPostCount = asyncHandler(async (req, res) => {
    const { userId } = req.params
    
    const count = await Post.countDocuments({ author: userId })

    res.status(200).json(
        new ApiResponse(200, "Post count fetched", { count })
    )
})
