import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchFeed = createAsyncThunk(
    "feed/fetchFeed",
    async (page = 0, { rejectWithValue }) => {
        try {
            const res = await api.get(`/feed/my?page=${page}`);
            return res.data.data.posts; 
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Could not fetch feed");
        }
    }
);

const feedSlice = createSlice({
    name: "feed",
    initialState: {
        posts: [],
        page: 0,
        loading: false,
        hasMore: true
    },
    reducers: {
        resetFeed: (state) => {
            state.posts = [];
            state.page = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeed.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeed.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg === 0) {
                    state.posts = action.payload;
                } else {
                    state.posts.push(...action.payload);
                }
                state.page += 1;
            })
            .addCase(fetchFeed.rejected, (state) => {
                state.loading = false;
            });
            
    }
});

export const { resetFeed } = feedSlice.actions;
export default feedSlice.reducer;