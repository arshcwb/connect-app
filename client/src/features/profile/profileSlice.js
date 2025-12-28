import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUserProfile = createAsyncThunk(
    "profile/fetchUserProfile",
    async (username, { rejectWithValue }) => {
        try {
            const res = await api.get(`/user/${username}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "User not found");
        }
    }
);

export const fetchProfilePostCount = createAsyncThunk(
    "profile/fetchProfilePostCount",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/post/count/${userId}`);
            return res.data.data.count;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchProfilePosts = createAsyncThunk(
    "profile/fetchProfilePosts",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/post/all/${userId}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue({ 
                message: err.response?.data?.message, 
                status: err.response?.status 
            });
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        user: null,
        friendsCount: 0,
        postCount: 0,
        posts: [],
        loading: false,
        postsLoading: false,
        error: null,
        postsError: null,
    },
    reducers: {
        clearProfile: (state) => {
            state.user = null;
            state.posts = [];
            state.error = null;
            state.postsError = null;
        }
    },
    _extraReducers: (builder) => {
        builder
            // Fetch user
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.friendsCount = action.payload.friendsCount;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch Post Count
            .addCase(fetchProfilePostCount.fulfilled, (state, action) => {
                state.postCount = action.payload;
            })

            // Fetch Posts
            .addCase(fetchProfilePosts.pending, (state) => {
                state.postsLoading = true;
                state.postsError = null;
            })

            // Fetch Post
            .addCase(fetchProfilePosts.fulfilled, (state, action) => {
                state.postsLoading = false;
                state.posts = action.payload;
            })
            .addCase(fetchProfilePosts.rejected, (state, action) => {
                state.postsLoading = false;
                state.posts = [];
                state.postsError = action.payload;
            });
    },
    get extraReducers() {
        return this._extraReducers;
    },
    set extraReducers(value) {
        this._extraReducers = value;
    },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;