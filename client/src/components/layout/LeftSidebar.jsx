import { useState, useEffect, useRef } from "react"; // Added useRef
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faEnvelope, faHeart, faUser, faSquarePlus, faBars } from "@fortawesome/free-solid-svg-icons";

import api from "../../services/api";
import { 
    fetchUnreadCount, 
    fetchNotifications, 
    markNotificationRead,
    clearAllNotifications,
    deleteNotification,
    markRequestAccepted,
    markAllRead
} from "../../features/notification/notificationSlice";
import { logoutUser } from "../../features/auth/authSlice";

import LogoutButton from "./Logout.jsx";
import noProfile from "../../assets/no-profile-picture.jpg";
import "../../css/LeftSidebar.css";
import CreatePostModal from "../post/CreatePost.jsx";
import SettingsModal from "../settings/SettingsModal";
import EditProfileModal from "../profile/EditProfileModal";

export default function LeftSidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const sidebarRef = useRef(null);
    
    const { unreadCount, items: notifications, loading: notifLoading } = useSelector(state => state.notification);
    const { user: currentUser, isLoggingOut } = useSelector(state => state.auth);

    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    const userData = currentUser?.user || currentUser;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActiveTab(null);
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setActiveTab(null);
            }
        };

        if (activeTab) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscKey);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [activeTab]);

    useEffect(() => {
        if (currentUser && !isLoggingOut) {
            dispatch(fetchUnreadCount());
        }
    }, [dispatch, currentUser, isLoggingOut]);

    useEffect(() => {
        if (activeTab === "notifications" && !isLoggingOut) {
            dispatch(fetchNotifications());
        }
    }, [activeTab, dispatch, isLoggingOut]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const res = await api.get(`/user/search/${searchQuery}`);
                    setSearchResults(res.data.data);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 50);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const toggleTab = (tabName) => {
        if (activeTab === tabName) {
            setActiveTab(null);
        } else {
            setActiveTab(tabName);
        }
    };

    const handleNotificationClick = (notif) => {
        if (!notif.isRead) {
            dispatch(markNotificationRead(notif._id));
        }
        if (notif.sender?.username) {
            navigate(`/profile/${notif.sender.username}`);
            setActiveTab(null);
        }
    };

    const handleClearAllNotifications = () => {
        if (window.confirm("Are you sure you want to clear all notifications?")) {
            dispatch(clearAllNotifications());
        }
    };

    const handleMarkAllRead = () => {
        dispatch(markAllRead());
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            window.location.href = "/login"; 
        }
    };

    const handleAcceptRequest = async (e, notif) => {
        e.stopPropagation();
        
        dispatch(markRequestAccepted(notif._id));

        try {
            await api.post(`/friends/accept/${notif.sender._id}`);
        } catch (error) {
            console.error("Failed to accept", error);
        }
    };

    const handleRejectRequest = async (e, notif) => {
        e.stopPropagation();

        dispatch(deleteNotification(notif._id));

        try {
            await api.post(`/friends/reject/${notif.sender._id}`);
        } catch (error) {
            console.error("Failed to reject", error);
        }
    };

    return (
        <div className="sidebar-container" ref={sidebarRef}>
           
            <aside className={`left-sidebar ${activeTab ? 'collapsed' : 'expanded'}`}>
                
                <Link to="/home" className="nav-item" onClick={() => setActiveTab(null)}>
                    <FontAwesomeIcon icon={faHome} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Home</span>}
                </Link>

                <div className="nav-item" onClick={() => toggleTab('search')}>
                    <FontAwesomeIcon icon={faSearch} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Search</span>}
                </div>

                <div className="nav-item">
                    <FontAwesomeIcon icon={faEnvelope} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Messages</span>}
                </div>

                <div className="nav-item" onClick={() => toggleTab('notifications')}>
                    <div style={{ position: 'relative' }}>
                        <FontAwesomeIcon icon={faHeart} className="nav-icon" />
                        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                    </div>
                    {!activeTab && <span className="nav-label">Notifications</span>}
                </div>

                <div className="nav-item" onClick={() => setShowCreateModal(true)}>
                    <FontAwesomeIcon icon={faSquarePlus} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Create</span>}
                </div>

                <Link to="/profile/me" className="nav-item" onClick={() => setActiveTab(null)}>
                    <FontAwesomeIcon icon={faUser} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Profile</span>}
                </Link>

                <div className="nav-item" onClick={() => setShowSettings(true)}>
                    <FontAwesomeIcon icon={faBars} className="nav-icon" />
                    {!activeTab && <span className="nav-label">Settings</span>}
                </div>

                <div 
                    className="nav-item" 
                    id="logout-btn" 
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                >
                    <LogoutButton />
                </div>
            </aside>

            <div className={`slide-panel search ${activeTab === 'search' ? 'open' : ''}`}>
                <h2>Search</h2>
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
                
                <div className="panel-results">
                    {searching && <p>Searching...</p>}
                    
                    {searchResults.map(user => (
                        <Link 
                            key={user._id} 
                            to={`/profile/${user.username}`} 
                            className="panel-item"
                            onClick={() => setActiveTab(null)}
                        >
                            <img src={user.picture?.url || noProfile} alt="" className="panel-avatar" />
                            <div className="panel-info">
                                <span className="panel-bold">{user.username}</span>
                                <span className="panel-gray">{user.firstName} {user.lastName}</span>
                            </div>
                        </Link>
                    ))}

                    {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p className="panel-gray">No users found.</p>
                    )}
                </div>
            </div>

            <div className={`slide-panel ${activeTab === 'notifications' ? 'open' : ''}`}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0 5px 15px 5px', 
                    borderBottom: '1px solid #eee',
                    marginBottom: '10px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Notifications</h2>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    color: '#0095f6', 
                                    cursor: 'pointer', 
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    padding: '5px',
                                }}
                            >
                                Mark read
                            </button>
                        )}

                        <button 
                            onClick={handleClearAllNotifications}
                            disabled={notifications.length === 0}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: notifications.length === 0 ? '#ccc' : '#ed4956',
                                cursor: notifications.length === 0 ? 'default' : 'pointer', 
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                padding: '5px',
                                transition: 'color 0.2s'
                            }}
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="panel-results">
                    {notifLoading ? <p>Loading...</p> : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
                            <FontAwesomeIcon icon={faHeart} size="3x" style={{ marginBottom: '15px', opacity: 0.3 }} />
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif._id} 
                                className="panel-item"
                                onClick={() => handleNotificationClick(notif)}
                                style={{ 
                                    opacity: notif.isRead ? 0.6 : 1, 
                                    cursor: 'pointer',
                                    padding: '12px 10px',
                                    borderBottom: '1px solid #f5f5f5'
                                }}
                            >
                                <img 
                                    src={notif.sender?.picture?.url || noProfile} 
                                    alt="" 
                                    className="panel-avatar" 
                                />
                                
                                <div className="panel-info">
                                    <span className="panel-bold">{notif.sender?.username}</span>
                                    
                                    <span>
                                        {notif.type === 'like' && ' liked your post.'}
                                        {notif.type === 'comment' && ' commented on your post.'}
                                        {notif.type === 'reply' && ' replied to your comment.'}
                                        {notif.type === 'follow' && ' started following you.'}
                                        {notif.type === 'friend_accept' && ' is your friend now.'}
                                        {notif.type === 'friend_request' && ' sent you a friend request.'}
                                    </span>

                                    {notif.type === 'friend_request' && (
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={(e) => handleAcceptRequest(e, notif)}
                                                style={{
                                                    padding: '6px 14px',
                                                    backgroundColor: '#0095f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={(e) => handleRejectRequest(e, notif)}
                                                style={{
                                                    padding: '6px 14px',
                                                    backgroundColor: '#efefef',
                                                    color: 'black',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {!notif.isRead && notif.type !== 'friend_request' && <div className="unread-dot"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
            

            {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
            )}

            {showSettings && (
                <SettingsModal 
                    onClose={() => setShowSettings(false)}
                    onEditProfile={() => {
                        setShowSettings(false);
                        setShowEditProfile(true);
                    }}
                />
            )}

            {showEditProfile && userData && (
                <EditProfileModal 
                    user={userData} 
                    onClose={() => setShowEditProfile(false)} 
                />
            )}
        </div>
    );
}