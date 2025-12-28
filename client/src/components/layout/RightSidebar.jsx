import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRecommendations } from '../../features/friend/friendSlice';
import noProfile from '../../assets/no-profile-picture.jpg';
import '../../css/RightSidebar.css'; 
import FriendButton from '../profile/FriendButton';

export default function RightSidebar() {
    const dispatch = useDispatch();
    const { recommendations, loading } = useSelector((state) => state.friend);
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchRecommendations());
        }
    }, [dispatch, currentUser]);

    if (loading) return (
        <aside className="right-sidebar">
            <p className="sidebar-loading">Loading suggestions...</p>
        </aside>
    );

    return (
        <aside className="right-sidebar">
            <div className="sidebar-header">
                <h4>Some suggestions for you</h4>
            </div>

            <div className="suggestions-list">
                {recommendations.length > 0 ? (
                    recommendations.map((user) => (
                        <div key={user._id} className="suggestion-item">

                            <Link to={`/profile/${user.username}`} className="suggestion-info">
                                <img 
                                    src={user.picture?.url || noProfile} 
                                    alt={user.username} 
                                    className="suggestion-avatar"
                                />
                                <div className="suggestion-text">
                                    <span className="suggestion-username">{user.username}</span>
                                    <span className="suggestion-name">
                                        {user.firstName} {user.lastName}
                                    </span>
                                </div>
                            </Link>

                            <FriendButton userId={user._id}/>
                        </div>
                    ))
                ) : (
                    <p className="no-suggestions">No suggestions available.</p>
                )}
            </div>

            <div className="sidebar-footer">
                <p>© 2025 CONNECT by arshcwb</p>
            </div>
        </aside>
    );
}