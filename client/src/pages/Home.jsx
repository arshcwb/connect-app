import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeed } from "../features/feed/feedSlice";
import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/post/PostCard";

export default function Home() {
    const dispatch = useDispatch();
    const { posts, loading } = useSelector(state => state.feed);

    useEffect(() => {
        dispatch(fetchFeed(0));
    }, [dispatch]);

    return (
        <MainLayout>
            <div className="feed-container">
                {posts.map(post => (
                    <PostCard key={post._id} post={post} />
                ))}

                {!loading && posts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No posts to show here, please send request to someone with a public profile, or be friends with a private profile.</p>
                    </div>
                )}

                {loading && <p>Loading more posts...</p>}
            </div>
        </MainLayout>
    );
}