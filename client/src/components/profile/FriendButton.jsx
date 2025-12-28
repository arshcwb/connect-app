import { useDispatch, useSelector } from 'react-redux';
import { sendFriendRequest, removeFriend } from '../../features/friend/friendSlice';
import '../../css/FriendButton.css';

export default function FriendButton({ userId }) {
    const dispatch = useDispatch();
    
    const { friendIds, sentRequestIds } = useSelector((state) => state.friend);
    
    const isFriend = friendIds.includes(userId);
    const isPending = sentRequestIds.includes(userId);

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isFriend) {
            if (window.confirm("Are you sure you want to remove this friend?")) {
                dispatch(removeFriend(userId));
            }
        } else if (!isPending) {
            dispatch(sendFriendRequest(userId));
        }
    };

    if (isFriend) {
        return (
            <button className="friend-btn" id="btn-remove" onClick={handleAction}>
                Remove
            </button>
        );
    }

    if (isPending) {
        return (
            <button className="friend-btn" id="btn-pending" disabled>
                Pending
            </button>
        );
    }

    return (
        <button className="friend-btn" id="btn-follow" onClick={handleAction}>
            Follow
        </button>
    );
}