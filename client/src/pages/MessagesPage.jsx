import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, fetchMessages, sendMessage, openChatWithUser } from "../features/message/messageSlice";
import noProfile from "../assets/no-profile-picture.jpg";
import "../css/Messages.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCommentDots } from "@fortawesome/free-solid-svg-icons";

export default function MessagesPage() {
    const dispatch = useDispatch();
    const bottomRef = useRef(null);
    const [inputText, setInputText] = useState("");

    const { conversations, activeConversation, messages } = useSelector(state => state.message);
    const { user } = useSelector(state => state.auth);

    const currentUserData = user?.user || user;
    const currentUserId = currentUserData?._id;

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    useEffect(() => {
        if (activeConversation) {
            dispatch(fetchMessages(activeConversation._id));
        }
    }, [activeConversation, dispatch]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getOtherUser = (conv) => {
        if (!conv || !conv.participants || !currentUserId) return {};
        const other = conv.participants.find(p => String(p._id) !== String(currentUserId));
        return other || conv.participants[0] || {};
    };

    const handleConversationClick = async (conv) => {
        const otherUser = getOtherUser(conv);
        if (otherUser?._id) {
            await dispatch(openChatWithUser(otherUser._id));
            dispatch(fetchConversations());
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConversation) return;

        await dispatch(sendMessage({
            conversationId: activeConversation._id,
            content: inputText
        }));
        setInputText("");
        dispatch(fetchConversations());
    };

    const activeChatUser = activeConversation ? getOtherUser(activeConversation) : {};

    return (
        <div className="messages-container">
            <div className="msg-sidebar">
                <div className="msg-header">
                    <h3>Messages</h3>
                    <FontAwesomeIcon icon={faCommentDots} />
                </div>

                <div className="conv-list">
                    {conversations.map(conv => {
                        const otherUser = getOtherUser(conv);
                        const isActive = activeConversation?._id === conv._id;
                        
                        const hasUnread = conv.unreadCount > 0;

                        const displayName = otherUser.firstName 
                            ? `${otherUser.firstName} ${otherUser.lastName}` 
                            : (otherUser.username || "User");

                        return (
                            <div
                                key={conv._id}
                                className={`conv-item ${isActive ? "active" : ""}`}
                                onClick={() => handleConversationClick(conv)}
                            >
                                <div style={{ position: "relative" }}>
                                    <img
                                        src={otherUser.picture?.url || noProfile}
                                        alt="avatar"
                                        className="conv-avatar"
                                    />

                                    {hasUnread && (
                                        <div style={{
                                            position: "absolute",
                                            top: "2px",
                                            right: "10px",
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: "#ff3b30",
                                            borderRadius: "50%",
                                            border: "2px solid white"
                                        }} />
                                    )}
                                </div>
                                
                                <div className="conv-info">
                                    <h4 
                                        className="conv-name"
                                        style={{ fontWeight: hasUnread ? "700" : "400" }}
                                    >
                                        {displayName}
                                    </h4>
                                    
                                    <p 
                                        className="conv-last-msg"
                                        style={{ 
                                            fontWeight: hasUnread ? "700" : "400",
                                            color: hasUnread ? "#262626" : "#8e8e8e"
                                        }}
                                    >
                                        {conv.lastMessage?.sender === currentUserId && "You: "}
                                        {conv.lastMessage?.content || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chat-area">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            <img
                                src={activeChatUser.picture?.url || noProfile}
                                alt="header-avatar"
                                className="chat-header-avatar"
                            />
                            <div className="chat-header-info">
                                <h3>
                                    {activeChatUser.firstName ? `${activeChatUser.firstName} ${activeChatUser.lastName}` : activeChatUser.username}
                                </h3>
                            </div>
                        </div>

                        <div className="chat-body">
                            {messages.map((msg, index) => {
                                const isOwn = String(msg.sender._id || msg.sender) === String(currentUserId);
                                const senderPic = msg.sender?.picture?.url || noProfile;

                                return (
                                    <div 
                                        key={msg._id} 
                                        className={`message-row ${isOwn ? "row-own" : "row-other"}`}
                                    >
                                        {!isOwn && (
                                            <img 
                                                src={senderPic} 
                                                alt="" 
                                                className="msg-avatar-small"
                                            />
                                        )}
                                        
                                        <div className={`message-bubble ${isOwn ? "msg-own" : "msg-other"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        <form className="chat-footer" onSubmit={handleSendMessage}>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Message..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="send-btn"
                                disabled={!inputText.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon-circle">
                            <FontAwesomeIcon icon={faPaperPlane} size="3x" />
                        </div>
                        <h2>Your Messages</h2>
                        <p>Send private photos and messages to a friend.</p>
                    </div>
                )}
            </div>
        </div>
    );
}