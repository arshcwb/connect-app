import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUnreadCount = createAsyncThunk(
    "notification/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/notification/count/unread");
            return res.data.data.count;
        } catch (err) {
            return rejectWithValue(0);
        }
    }
);

export const fetchNotifications = createAsyncThunk(
    "notification/fetchNotifications",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/notification/all");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    "notification/markRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            await api.post(`/notification/read/${notificationId}`);
            return notificationId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const clearAllNotifications = createAsyncThunk(
    "notification/clearAll",
    async (_, { rejectWithValue }) => {
        try {
            await api.delete("/notification/all");
            return;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    "notification/deleteSingle",
    async (notificationId, { rejectWithValue }) => {
        try {
            await api.delete(`/notification/${notificationId}`);
            return notificationId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        markRequestAccepted: (state, action) => {
            const notificationId = action.payload;
            const notification = state.items.find(item => item._id === notificationId);
            if (notification) {
                notification.type = "friend_accept";
                notification.isRead = true;
            }
            if (state.unreadCount > 0) state.unreadCount -= 1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const item = state.items.find(n => n._id === action.payload);
                if (item && !item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(clearAllNotifications.fulfilled, (state) => {
                state.items = [];
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item._id !== action.payload);
            });
    }
});

export const { addNotification, markRequestAccepted } = notificationSlice.actions;
export default notificationSlice.reducer;