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

export default function PostCard({ post }) {
    const { _id, author, content, media, likesCount, commentsCount } = post;
    const dispatch = useDispatch();
    
    const currentUser = useSelector((state) => state.auth.user);
    const likedPostIds = useSelector((state) => state.auth.userLikes?.postIds || []);
    
    const currentUserId = currentUser?.user?._id || currentUser?._id;
    const isMe = currentUserId === author._id;
    
    const isLikedByMe = likedPostIds.includes(_id);

    const [liked, setLiked] = useState(isLikedByMe);
    const [count, setCount] = useState(likesCount);
    const [isLiking, setIsLiking] = useState(false);
    
    const [zoomIndex, setZoomIndex] = useState(null);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLiked(isLikedByMe);
    }, [isLikedByMe]);

    useEffect(() => {
        setCount(likesCount);
    }, [likesCount]);

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

    const fetchLikedUsers = async () => {
        setShowLikesModal(true);
        setLoadingLikes(true);
        try {
            const res = await api.get(`/like/get/post/${_id}`);
            setLikedUsers(res.data.data.users);
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
                <Link to={`/profile/${author.username}`} className="header-left-link">
                    <div className="header-left">
                        <img 
                            src={author.picture?.url || noProfile} 
                            className="avatar" 
                            alt="" 
                        />
                        <div className="author-info">
                            <span className="author-name">
                                {author.firstName} {author.lastName}
                            </span>
                            <span className="author-username">@{author.username}</span>
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
                
                <button className="stat-btn">
                    <FontAwesomeIcon icon={faComment} />
                    <span>{commentsCount}</span>
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
                                likedUsers.map(user => (
                                    <div key={user._id} className="user-row">
                                        <div className="user-row-info">
                                            <p className="user-row-username">@{user.username}</p>
                                        </div>
                                    </div>
                                ))
                            ) : <p>No likes yet.</p>}
                        </div>
                    </div>
                </div>
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