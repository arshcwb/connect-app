import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImage } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { fetchFeed } from '../../features/feed/feedSlice';
import noProfile from '../../assets/no-profile-picture.jpg';
import '../../css/CreatePost.css';

export default function CreatePostModal({ onClose }) {
    const dispatch = useDispatch();
    
    const { user } = useSelector((state) => state.auth);
    const currentUser = user?.user || user;
    const profileVisibility = currentUser?.profileVisibility || 'public'; 

    let allowedOptions = [];

    if (profileVisibility === 'public') {
        allowedOptions = [
            { value: 'public', label: 'Public (Everyone)' },
            { value: 'private', label: 'Only Me' }
        ];
    } else {
        allowedOptions = [
            { value: 'friends', label: 'Friends Only' },
            { value: 'private', label: 'Only Me' }
        ];
    }

    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState(allowedOptions[0].value);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            alert("Max 5 files allowed");
            return;
        }

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setFiles(prev => [...prev, ...selectedFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);
        
        files.forEach(file => {
            formData.append("media", file);
        });

        try {
            await api.post("/post/create", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            dispatch(fetchFeed());
            onClose();

        } catch (error) {
            console.error("Failed to create post", error);
            alert(error.response?.data?.message || "Error creating post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-overlay" onClick={onClose}>
            <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                
                <div className="create-post-header">
                    <span>Create new post</span>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="create-post-body">

                    <div className="user-info-row">
                        <img 
                            src={currentUser?.picture?.url || noProfile} 
                            alt="" 
                            className="cp-avatar" 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="cp-username">{currentUser?.username}</span>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                Profile: {profileVisibility === 'private' ? 'Private 🔒' : 'Public 🌍'}
                            </span>
                        </div>
                    </div>

                    <textarea 
                        className="post-textarea" 
                        placeholder={`What's on your mind, ${currentUser?.firstName}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {previews.length > 0 && (
                        <div className="image-preview-container">
                            {previews.map((src, index) => (
                                <div key={index} className="preview-wrapper">
                                    <img src={src} alt="" className="preview-img" />
                                    <button className="remove-img-btn" onClick={() => removeFile(index)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="visibility-section">
                        <div className="visibility-row">
                            <span className="vis-label">Visibility:</span>
                            <select 
                                className="vis-select" 
                                value={visibility} 
                                onChange={(e) => setVisibility(e.target.value)}
                            >
                                {allowedOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="caution-box">
                            {visibility === 'public' && "Visible to everyone."}
                            {visibility === 'friends' && "Visible only to your friends."}
                            {visibility === 'private' && "Visible only to you."}
                        </div>
                    </div>

                    <div className="footer-actions">
                        <div className="media-actions">
                            <label className="add-media-btn" onClick={() => fileInputRef.current.click()}>
                                <FontAwesomeIcon icon={faImage} />
                            </label>
                            <input 
                                type="file" 
                                hidden 
                                multiple 
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        <button 
                            className="post-submit-btn" 
                            onClick={handleSubmit}
                            disabled={loading || (!content.trim() && files.length === 0)}
                        >
                            {loading ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}