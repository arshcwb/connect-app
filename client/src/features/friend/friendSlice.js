import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchRecommendations = createAsyncThunk(
    "friend/fetchRecommendations",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/friend/recommended");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Could not fetch suggestions");
        }
    }
);

export const fetchSentRequests = createAsyncThunk(
    "friend/fetchSentRequests",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/friend/requests/sent");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchMyFriends = createAsyncThunk(
    "friend/fetchMyFriends",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/friend/all");
            return res.data.data.friends.map(f => f._id);
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const sendFriendRequest = createAsyncThunk(
    "friend/sendFriendRequest",
    async (friendId, { rejectWithValue }) => {
        try {
            await api.post(`/friend/requests/send/${friendId}`);
            return friendId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const removeFriend = createAsyncThunk(
    "friend/removeFriend",
    async (friendId, { rejectWithValue }) => {
        try {
            await api.post(`/friend/remove/${friendId}`);
            return friendId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

const friendSlice = createSlice({
    name: "friend",
    initialState: {
        recommendations: [],
        friendIds: [],
        sentRequestIds: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Recommendations
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.recommendations = action.payload;
            })
            
            // Fetch Friends
            .addCase(fetchMyFriends.fulfilled, (state, action) => {
                state.friendIds = action.payload; 
            })

            // Send Request
            .addCase(sendFriendRequest.fulfilled, (state, action) => {
                state.sentRequestIds.push(action.payload);
            })

            // Remove Friend 
            .addCase(removeFriend.fulfilled, (state, action) => {
                state.friendIds = state.friendIds.filter(id => id !== action.payload);
            })

            // Fetch sent requests
            .addCase(fetchSentRequests.fulfilled, (state, action) => {
                state.sentRequestIds = action.payload; 
            });
            
    },
});

export default friendSlice.reducer;