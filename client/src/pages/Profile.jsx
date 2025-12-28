import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, fetchProfilePosts, fetchProfilePostCount, clearProfile } from "../features/profile/profileSlice";
import MainLayout from "../components/layout/MainLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import PostCard from "../components/post/PostCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import '../css/Profile.css';

export default function Profile() {
    const { username: paramUsername } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const authData = useSelector((state) => state.auth.user);
    const currentUser = authData?.user || authData;

    const { 
        user: profileUser, 
        friendsCount, 
        postCount, 
        posts, 
        loading, 
        postsLoading, 
        postsError 
    } = useSelector((state) => state.profile);

    const isMePath = paramUsername === "me";
    const isMe = isMePath || (currentUser?.username === paramUsername);

    useEffect(() => {
        if (currentUser && paramUsername === currentUser.username) {
            navigate("/profile/me", { replace: true });
        }
    }, [currentUser, paramUsername, navigate]);

    useEffect(() => {
        const userToFetch = isMePath ? currentUser?.username : paramUsername;
        if (userToFetch) {
            dispatch(clearProfile());
            dispatch(fetchUserProfile(userToFetch));
        }
    }, [dispatch, isMePath, currentUser?.username, paramUsername]);

    useEffect(() => {
        if (profileUser?._id) {
            dispatch(fetchProfilePosts(profileUser._id));
            dispatch(fetchProfilePostCount(profileUser._id));
        }
    }, [dispatch, profileUser]);


    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    if (loading) return <MainLayout><p style={{textAlign:'center', marginTop: 50}}>Loading Profile...</p></MainLayout>;
    if (isMePath && !currentUser) return null; 
    if (!profileUser) return <MainLayout><p style={{textAlign:'center', marginTop: 50}}>User not found</p></MainLayout>;

    return (
        <MainLayout>
            <div className="profile-page">
                <ProfileHeader 
                    user={profileUser} 
                    friendsCount={friendsCount} 
                    postCount={postCount}
                    isMe={isMe}
                    onEdit={handleEditClick} 
                />

                <div className="profile-content">
                    <h3>Posts</h3>
                    {postsLoading && <p>Loading posts...</p>}

                    {!postsLoading && postsError?.status === 403 && (
                        <div className="private-message">
                            <span style={{ fontSize: '40px' }}>🔒</span>
                            <h4>This Account is Private</h4>
                            <p>Be friends with <b>@{profileUser.username}</b> to see their posts.</p>
                        </div>
                    )}

                    {!postsLoading && !postsError && posts.length === 0 && (
                        <div className="empty-message">
                            <h4>No Posts Yet</h4>
                            <p>{isMe ? "You haven't posted anything." : "This user hasn't posted anything yet."}</p>
                        </div>
                    )}
                    
                    {!postsLoading && posts.length > 0 && (
                        <div className="profile-feed">
                            {posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </div>

                {isEditModalOpen && (
                    <EditProfileModal 
                        user={profileUser} 
                        onClose={() => setIsEditModalOpen(false)} 
                    />
                )}
            </div>
        </MainLayout>
    );
}