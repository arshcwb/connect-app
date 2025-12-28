import FriendButton from './FriendButton';
import noProfile from '../../assets/no-profile-picture.jpg';

export default function ProfileHeader({ user, friendsCount, postCount, isMe, onEdit }) {
    if (!user) return null;

    return (
        <div className="profile-header-card">
            <div className="profile-cover" />
            <div className="profile-info-container">
                <div className="profile-avatar-wrapper">
                    <img 
                        src={user.picture?.url || noProfile} 
                        alt={user.username} 
                        className="profile-avatar-lg"
                    />
                </div>

                <div className="profile-details">
                    <h2 className="profile-name">
                        {user.firstName} {user.middleName ? `${user.middleName} ` : ''}{user.lastName}
                    </h2>
                    <p className="profile-username">@{user.username}</p>
                    
                    {(user.occupation || user.location) && (
                        <div className="profile-meta">
                            {user.occupation && <span>💼 {user.occupation}</span>}
                            {user.location && <span>📍 {user.location}</span>}
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    {isMe ? (
                        <button className="edit-btn" onClick={onEdit}>Edit Profile</button>
                    ) : (
                        <FriendButton userId={user._id}/>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-box">
                    <span className="stat-num">{postCount}</span>
                    <span className="stat-label">Posts</span>
                </div>
                <div className="stat-box">
                    <span className="stat-num">{friendsCount}</span>
                    <span className="stat-label">Friends</span>
                </div>
            </div>
        </div>
    );
}
