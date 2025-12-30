import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faReply } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import noProfile from '../../assets/no-profile-picture.jpg';
import '../../css/CommentsModal.css';

export default function CommentsModal({ postId, onClose, updateCommentsCount }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);
    
    const [replyingTo, setReplyingTo] = useState(null);

    const authObj = useSelector(state => state.auth.user);
    const currentUser = authObj?.user || authObj; 
    const currentUserId = currentUser?._id;

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/comment/get/${postId}`);
            setComments(res.data.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPosting(true);
        try {
            const payload = { 
                postId: postId,
                content: newComment,
                parentComment: replyingTo ? replyingTo.id : null 
            };

            const res = await api.post('/comment/add', payload);
            
            const addedComment = {
                ...res.data.data,
                author: {
                    _id: currentUserId,
                    username: currentUser.username,
                    picture: currentUser.picture
                }
            };
            
            setComments(prev => [...prev, addedComment]);
            setNewComment("");
            setReplyingTo(null);
            
            if (updateCommentsCount) updateCommentsCount(1);
            
            if (!replyingTo) {
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }

        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setPosting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;

        try {
            await api.delete(`/comment/delete/${commentId}`);
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    return { ...c, isDeleted: true, content: "This comment was deleted" };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const startReply = (comment) => {
        setReplyingTo({ 
            id: comment._id, 
            username: comment.author?.username 
        });
        inputRef.current?.focus();
    };

    const getGroupedComments = () => {
        const roots = comments.filter(c => !c.parentComment);
        const getReplies = (parentId) => comments.filter(c => c.parentComment === parentId);
        return { roots, getReplies };
    };

    const { roots, getReplies } = getGroupedComments();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    const renderCommentItem = (comment, isReply = false) => (
        <div key={comment._id} className={`comment-item ${isReply ? 'reply-item' : ''}`}>
            <Link to={`/profile/${comment.author?.username}`}>
                <img 
                    src={comment.author?.picture?.url || noProfile} 
                    alt="" 
                    className="comment-avatar" 
                    style={{ width: isReply ? '24px' : '32px', height: isReply ? '24px' : '32px' }}
                />
            </Link>
            
            <div className="comment-bubble">
                <div className="comment-content-box">
                    <Link to={`/profile/${comment.author?.username}`} className="comment-username">
                        {comment.author?.username || "Unknown"}
                    </Link>
                    <span className={comment.isDeleted ? "comment-deleted" : "comment-text"}>
                        {comment.content}
                    </span>
                </div>
                
                <div className="comment-meta">
                    <span>{formatDate(comment.createdAt)}</span>
                    
                    {!comment.isDeleted && (
                        <button className="reply-btn" onClick={() => startReply(comment)}>
                            Reply
                        </button>
                    )}

                    {comment.author?._id === currentUserId && !comment.isDeleted && (
                        <button 
                            className="delete-comment-btn" 
                            onClick={() => handleDeleteComment(comment._id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={e => e.stopPropagation()}>
                
                <div className="comments-header">
                    <span>Comments</span>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="comments-list">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Loading...</p>
                    ) : comments.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                            <p>No comments yet.</p>
                        </div>
                    ) : (
                        roots.map(root => (
                            <div key={root._id}>
                                {renderCommentItem(root)}
                                
                                <div style={{ paddingLeft: '45px' }}>
                                    {getReplies(root._id).map(reply => renderCommentItem(reply, true))}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                <form className="comment-input-area" onSubmit={handlePostComment}>
                    {replyingTo && (
                        <div className="replying-banner">
                            <span>Replying to <b>@{replyingTo.username}</b></span>
                            <button type="button" onClick={() => setReplyingTo(null)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                        <input 
                            type="text" 
                            className="comment-input"
                            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Write a comment..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            ref={inputRef}
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            className="post-btn" 
                            disabled={!newComment.trim() || posting}
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}