import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faTimes, faChevronLeft, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { toggleLocalLike } from '../../features/auth/authSlice';
import { fetchFeed } from "../../features/feed/feedSlice";
import { fetchProfilePosts } from "../../features/profile/profileSlice";
import noProfile from '../../assets/no-profile-picture.jpg';
import '../../css/PostCard.css';
import { Link } from 'react-router-dom';
import CommentsModal from '../comment/CommentsModal';

export default function PostCard({ post }) {
    const { _id, author, content, media, likesCount, commentsCount } = post;
    const dispatch = useDispatch();
    
    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?.user?._id || currentUser?._id;

    const { friendIds, sentRequestIds } = useSelector((state) => state.friend || { friendIds: [], sentRequestIds: [] });

    const authorId = author?._id || author;
    const authorName = author?.firstName ? `${author.firstName} ${author.lastName}` : "Unknown";
    const authorUsername = author?.username || "unknown";
    const authorPic = author?.picture?.url || noProfile;

    const isMe = currentUserId?.toString() === authorId?.toString();

    const checkRelation = (list, targetId) => {
        if (!list || !targetId) return false;
        return list.some(item => {
            const itemId = typeof item === 'object' ? item._id : item;
            return itemId?.toString() === targetId.toString();
        });
    };

    const isFriend = checkRelation(friendIds, authorId);
    const isPending = checkRelation(sentRequestIds, authorId);

    const likedPostIds = useSelector((state) => state.auth.userLikes?.postIds || []);
    const isLikedByMe = likedPostIds.includes(_id);

    const [liked, setLiked] = useState(isLikedByMe);
    const [count, setCount] = useState(likesCount);
    const [commentsCountLocal, setCommentsCountLocal] = useState(commentsCount);
    const [isLiking, setIsLiking] = useState(false);
    
    const [requestSent, setRequestSent] = useState(isPending); 

    const [zoomIndex, setZoomIndex] = useState(null);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    const [likedUsers, setLikedUsers] = useState([]);
    const [totalLikesInModal, setTotalLikesInModal] = useState(0); 
    const [loadingLikes, setLoadingLikes] = useState(false);
    
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLiked(isLikedByMe);
    }, [isLikedByMe]);

    useEffect(() => {
        setCount(likesCount);
    }, [likesCount]);

    useEffect(() => {
        setCommentsCountLocal(commentsCount);
    }, [commentsCount]);

    useEffect(() => {
        setRequestSent(isPending);
    }, [isPending]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/post/delete/${_id}`);
            dispatch(fetchFeed());
            if (isMe) {
                dispatch(fetchProfilePosts(currentUserId));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete post");
            setIsDeleting(false);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isLiking) return;

        setIsLiking(true);
        dispatch(toggleLocalLike({ postId: _id }));
        setCount(prev => liked ? prev - 1 : prev + 1);

        try {
            await api.post(`/like/toggle/post/${_id}`);
        } catch (err) {
            dispatch(toggleLocalLike({ postId: _id }));
            setCount(prev => !liked ? prev - 1 : prev + 1);
        } finally {
            setIsLiking(false);
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        setRequestSent(true);

        try {
            await api.post(`/friend/requests/send/${authorId}`);
        } catch (error) {
            console.error("Follow failed", error);
            setRequestSent(false);
        }
    };

    const fetchLikedUsers = async () => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        try {
            const res = await api.get(`/like/get/post/${_id}`);
            setLikedUsers(res.data.data.users);
            setTotalLikesInModal(res.data.data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLikes(false);
        }
    };

    const showNext = useCallback((e) => {
        if (e) e.stopPropagation();
        setZoomIndex((prev) => (prev + 1) % media.length);
    }, [media.length]);

    const showPrev = useCallback((e) => {
        if (e) e.stopPropagation();
        setZoomIndex((prev) => (prev - 1 + media.length) % media.length);
    }, [media.length]);

    const closeZoom = () => setZoomIndex(null);

    useEffect(() => {
        if (zoomIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') closeZoom();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomIndex, showNext, showPrev]);

    if (isDeleting) return null;

    return (
        <div className="post-card">
            <div className="post-header">
                <Link to={`/profile/${authorUsername}`} className="header-left-link">
                    <div className="header-left">
                        <img 
                            src={authorPic} 
                            className="avatar" 
                            alt="" 
                        />
                        <div className="author-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="author-name">
                                    {authorName}
                                </span>
                                
                                {!isMe && !isFriend && (
                                    requestSent ? (
                                        <span className="following-text">Requested</span>
                                    ) : (
                                        <button 
                                            className="follow-btn" 
                                            onClick={handleFollow}
                                        >
                                            Follow
                                        </button>
                                    )
                                )}
                            </div>
                            <span className="author-username">@{authorUsername}</span>
                        </div>
                    </div>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isMe && <span className="you-badge">You</span>}
                    
                    {isMe && (
                        <button className="delete-btn" onClick={handleDelete} title="Delete Post">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    )}
                </div>
            </div>

            <div className="post-content">{content}</div>

            {media && media.length > 0 && (
                <div className="media-container">
                    {media.map((item, index) => (
                        <img 
                            key={item._id} 
                            src={item.url} 
                            className="post-image" 
                            alt="" 
                            onClick={() => setZoomIndex(index)}
                        />
                    ))}
                </div>
            )}

            <div className="post-footer">
                <div className="stat-group">
                    <button 
                        className={`stat-btn ${liked ? 'liked' : ''}`} 
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        <FontAwesomeIcon icon={faHeart} className={liked ? "heart-active" : ""} />
                    </button>
                    <span className="count-link" onClick={fetchLikedUsers}>{count}</span>
                </div>
                
                <button className="stat-btn" onClick={() => setShowCommentsModal(true)}>
                    <FontAwesomeIcon icon={faComment} />
                    <span>{commentsCountLocal}</span>
                </button>
            </div>

            {showLikesModal && (
                <div className="modal-overlay" onClick={() => setShowLikesModal(false)}>
                    <div className="likes-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            Liked by
                            <button className="close-x" onClick={() => setShowLikesModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingLikes ? <p>Loading...</p> : likedUsers.length > 0 ? (
                                <>
                                    {likedUsers.map(user => (
                                        <div key={user._id} className="user-row">
                                            <div className="user-row-info">
                                                <p className="user-row-username">@{user.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {totalLikesInModal > likedUsers.length && (
                                        <div style={{ 
                                            padding: '12px', 
                                            textAlign: 'center', 
                                            color: '#888', 
                                            borderTop: '1px solid #f0f0f0',
                                            fontSize: '0.9rem',
                                            fontStyle: 'italic'
                                        }}>
                                            And {totalLikesInModal - likedUsers.length} others...
                                        </div>
                                    )}
                                </>
                            ) : <p>No likes yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {showCommentsModal && (
                <CommentsModal 
                    postId={_id} 
                    onClose={() => setShowCommentsModal(false)}
                    updateCommentsCount={(num) => setCommentsCountLocal(prev => prev + num)}
                />
            )}

            {zoomIndex !== null && (
                <div className="zoom-overlay" onClick={closeZoom}>
                    <button className="close-btn" onClick={closeZoom}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    
                    {media.length > 1 && (
                        <>
                            <button className="nav-btn left" onClick={showPrev}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button className="nav-btn right" onClick={showNext}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </>
                    )}

                    <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
                        <img src={media[zoomIndex].url} alt="" className="zoomed-img" />
                        <p className="image-counter">{zoomIndex + 1} / {media.length}</p>
                    </div>
                </div>
            )}
        </div>
    );
}