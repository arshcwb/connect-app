import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/me");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Not logged in");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/user/login", credentials);
      return res.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/user/logout");
      return null;
    }
    catch (err) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const fetchUserLikes = createAsyncThunk(
    "auth/fetchUserLikes",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/like/all"); 
            return res.data.data; 
        } 
        catch (err) {
            console.error("Fetch likes failed:", err);
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true,
        userLikes: { postIds: [], commentIds: [] },
        error: null,
    },
    reducers: {
        resetError: (state) => {
            state.error = null;
        },
        toggleLocalLike: (state, action) => {
            const { postId } = action.payload;
            const index = state.userLikes.postIds.indexOf(postId);
            if (index !== -1) {
                state.userLikes.postIds.splice(index, 1);
            } else {
                state.userLikes.postIds.push(postId);
            }
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(fetchCurrentUser.rejected, (state) => {
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
        })
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.userLikes = { postIds: [], commentIds: [] };
        })
        .addCase(fetchUserLikes.fulfilled, (state, action) => {
            state.userLikes = {
                postIds: action.payload.postIds || [],
                commentIds: action.payload.commentIds || []
            };
        });
  },
});

export const { resetError, toggleLocalLike } = authSlice.actions;
export default authSlice.reducer;