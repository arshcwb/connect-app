import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import feedReducer from "../features/feed/feedSlice"
import profileReducer from "../features/profile/profileSlice"
import friendReducer from "../features/friend/friendSlice"
import notificationReducer from "../features/notification/notificationSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    profile: profileReducer,
    friend: friendReducer,
    notification: notificationReducer
  }
})
