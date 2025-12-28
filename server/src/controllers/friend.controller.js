import FriendRequest from "../models/friendRequest.model.js"
import Friend from "../models/friend.model.js"
import ApiError from "../../utils/ApiError.js"
import ApiResponse from "../../utils/ApiResponse.js"
import {asyncHandler} from "../../utils/asyncHandler.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"


export const getRequests = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  if (!userId) {
    throw new ApiError(401, "Unauthorized")
  }

  const requests = await FriendRequest.find({ to: userId })
    .populate("from", "username firstName lastName picture")

  const incoming = requests.map(r => r.from)

  res.status(200).json(
    new ApiResponse(200, "Incoming requests fetched", {
      count: incoming.length,
      incomingRequests: incoming
    })
  )
})

export const getSentRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const requests = await FriendRequest.find({ from: userId }).select("to");

    const toIds = requests.map(r => r.to.toString());

    res.status(200).json(
        new ApiResponse(200, "Sent requests fetched", toIds)
    );
});

export const sendRequest = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const { friendId } = req.params

  if (!userId) {
    throw new ApiError(401, "Unauthorized")
  }

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required")
  }

  if (userId.toString() === friendId) {
    throw new ApiError(400, "You cannot send a friend request to yourself")
  }

  const friend = await User.findById(friendId)
  if (!friend) {
    throw new ApiError(404, "User not found")
  }

  const reverseRequest = await FriendRequest.findOne({
    from: friendId,
    to: userId
  })

  if (reverseRequest) {
    await FriendRequest.deleteOne({ _id: reverseRequest._id })
    await Friend.create({ users: [userId, friendId] })

    await Notification.create({
      receiver: friendId,
      sender: userId,
      type: "friend_accept"
    })

    await Notification.create({
      receiver: userId,
      sender: friendId,
      type: "friend_accept"
    })

    return res.status(201).json(
      new ApiResponse(
        201,
        "Friend request accepted automatically",
        { friend }
      )
    )
  }

  const alreadySent = await FriendRequest.findOne({
    from: userId,
    to: friendId
  })

  if (alreadySent) {
    throw new ApiError(409, "Friend request already sent")
  }

  await FriendRequest.create({
    from: userId,
    to: friendId
  })

  await Notification.create({
    receiver: friendId,
    sender: userId,
    type: "friend_request"
  })

  return res.status(201).json(
    new ApiResponse(
      201,
      "Friend request sent successfully",
      null
    )
  )
})

export const acceptRequest = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { fromId } = req.params

    if (!userId) {
      throw new ApiError(401, "Unauthorized")
    }

    if (!fromId) {
      throw new ApiError(400, "Sender ID is required")
    }

    const request = await FriendRequest.findOne({
      from: fromId,
      to: userId
    })

    if (!request) {
      throw new ApiError(404, "Friend request not found")
    }

    await FriendRequest.deleteOne({ _id: request._id })

    await Friend.create({
      users: [userId, fromId]
    })

    await Notification.create({
      receiver: fromId,
      sender: userId,
      type: "friend_accept"
    })

    res.status(201).json(
      new ApiResponse(201, "Friend request accepted", null)
    )
})


export const rejectRequest = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const { fromId } = req.params

  if (!userId) {
    throw new ApiError(401, "Unauthorized")
  }

  if (!fromId) {
    throw new ApiError(400, "Sender ID is required")
  }

  await FriendRequest.deleteOne({
    from: fromId,
    to: userId
  })

  res.status(200).json(
    new ApiResponse(200, "Friend request rejected", null)
  )
})

export const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  if (!userId) {
    throw new ApiError(401, "Unauthorized")
  }

  const friendships = await Friend.find({ users: userId })
    .populate("users", "username firstName lastName picture")

  const friends = friendships.map(f =>
    f.users.find(u => u._id.toString() !== userId.toString())
  )

  res.status(200).json(
    new ApiResponse(200, "Friends fetched", {
      count: friends.length,
      friends
    })
  )
})

export const removeFriend = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const { friendId } = req.params

  if (!userId) {
    throw new ApiError(401, "Unauthorized")
  }

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required")
  }

  await Friend.deleteOne({
    users: { $all: [userId, friendId] }
  })

  res.status(200).json(
    new ApiResponse(200, "Friend removed successfully", null)
  )
})



export const getRecommendation = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const limit = 10

    const friendships = await Friend.find({ users: userId }).select("users")
    const friendIds = friendships.map(f =>
        f.users.find(u => u.toString() !== userId.toString())
    )

    const sentRequests = await FriendRequest.find({ from: userId }).select("to")
    const receivedRequests = await FriendRequest.find({ to: userId }).select("from")

    const excludedUserIds = [
        userId,
        ...friendIds,
        ...sentRequests.map(r => r.to),
        ...receivedRequests.map(r => r.from)
    ]

    const users = await User.aggregate([
        {
            $match: {
                _id: { $nin: excludedUserIds }
            }
        },
        { $sample: { size: limit } },
        {
            $project: {
                username: 1,
                firstName: 1,
                lastName: 1,
                picture: 1
            }
        }
    ])

    res.status(200).json(
        new ApiResponse(200, "Recommended users fetched", users)
    )
})

