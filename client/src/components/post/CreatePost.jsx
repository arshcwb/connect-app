import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faImage } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { fetchFeed } from "../../features/feed/feedSlice";
import "../../css/CreatePost.css";

export default function CreatePost({ onClose }) {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    
    const { user: authData } = useSelector((state) => state.auth);
    const currentUser = authData?.user || authData;
    const defaultVisibility = currentUser?.profileVisibility === "private" ? "friends" : "public";

    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]); 
    const [previews, setPreviews] = useState([]); 
    const [visibility, setVisibility] = useState(defaultVisibility);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (files.length + selectedFiles.length > 10) {
            alert("Maximum 10 files allowed");
            
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setFiles([...files, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0) {
            alert("Post can not be empty");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);
        
        files.forEach(file => {
            formData.append("media", file);
        });

        try {
            await api.post("/post/create", formData);
            
            dispatch(fetchFeed()); 
            
            onClose(); 
        } catch (err) {
            console.error("Failed to post", err);
            alert(err.response?.data?.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create new post</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="modal-body">
                    <textarea 
                        placeholder="What's on your mind?" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                    />

                    {previews.length > 0 && (
                        <div className="image-preview-grid">
                            {previews.map((src, index) => (
                                <div key={index} className="preview-container">
                                    <img src={src} alt="" />
                                    <button onClick={() => removeImage(index)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="controls-row">
                        <div className="add-media" onClick={() => fileInputRef.current.click()}>
                            <FontAwesomeIcon icon={faImage} />
                            <span>Add Photos/Videos</span>
                        </div>
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            hidden 
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                        />

                        <select 
                            value={visibility} 
                            onChange={(e) => setVisibility(e.target.value)}
                            className="visibility-select"
                        >
                            <option value="public">Public</option>
                            <option value="friends">Friends</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                        className="post-btn" 
                        onClick={handleSubmit} 
                        disabled={loading}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}