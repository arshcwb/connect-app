import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchConversations = createAsyncThunk(
    "message/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/conversation/c/get-all");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const openChatWithUser = createAsyncThunk(
    "message/openChatWithUser",
    async (otherUserId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/conversation/c/${otherUserId}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchMessages = createAsyncThunk(
    "message/fetchMessages",
    async (conversationId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/message/get/${conversationId}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const sendMessage = createAsyncThunk(
    "message/sendMessage",
    async ({ conversationId, content }, { rejectWithValue }) => {
        try {
            const res = await api.post("/message/send", { conversationId, content });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

const messageSlice = createSlice({
    name: "message",
    initialState: {
        conversations: [],
        activeConversation: null,
        messages: [],
        loading: false,
        sending: false,
        error: null
    },
    reducers: {
        clearActiveChat: (state) => {
            state.activeConversation = null;
            state.messages = [];
        },
        addMessageOptimistic: (state, action) => {
            state.messages.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
            })
            .addCase(openChatWithUser.fulfilled, (state, action) => {
                state.activeConversation = action.payload;
            })
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(sendMessage.pending, (state) => {
                state.sending = true;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sending = false;
                state.messages.push(action.payload);

                const convIndex = state.conversations.findIndex(
                    (c) => c._id === action.payload.conversation
                );
                if (convIndex !== -1) {
                    const updatedConv = {
                        ...state.conversations[convIndex],
                        lastMessage: action.payload
                    };
                    state.conversations.splice(convIndex, 1);
                    state.conversations.unshift(updatedConv);
                }
            });
    }
});

export const { clearActiveChat, addMessageOptimistic } = messageSlice.actions;
export default messageSlice.reducer;