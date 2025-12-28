import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import { fetchCurrentUser } from "../../features/auth/authSlice"; 
import "../../css/EditProfileModal.css";
import noProfile from "../../assets/no-profile-picture.jpg";

export default function EditProfileModal({ user, onClose }) {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "", 
        occupation: user.occupation || "", 
        location: user.location || "",
    });

    const [preview, setPreview] = useState(user.picture?.url || noProfile);
    const [newPictureFile, setNewPictureFile] = useState(null);
    const [isPictureRemoved, setIsPictureRemoved] = useState(false);
    const [isPrivate, setIsPrivate] = useState(user.profileVisibility === "private");
    const [loading, setLoading] = useState(false);

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPictureFile(file);
            setPreview(URL.createObjectURL(file)); 
            setIsPictureRemoved(false); 
        }
    };

    const handleRemovePicture = () => {
        setNewPictureFile(null);
        setPreview(noProfile);
        setIsPictureRemoved(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validateForm = () => {
        const { firstName, middleName, lastName, username, email, location, occupation } = formData;

        if (firstName && firstName.length > 50) return "First name must be less than 50 characters";
        if (middleName && middleName.length > 50) return "Middle name must be less than 50 characters";
        if (lastName && lastName.length > 50) return "Last name must be less than 50 characters";
        
        if (username && username.length < 3) return "Username must be at least 3 characters long";
        
        if (email && !email.includes("@")) return "Email must be a valid email";
        
        if (location && location.length > 100) return "Location must be less than 100 characters";
        if (occupation && occupation.length > 100) return "Occupation must be less than 100 characters";

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            alert(validationError);
            return;
        }

        setLoading(true);
        try {
            const promises = [];

            promises.push(api.patch("/user/update-profile", formData));

            if (isPictureRemoved && !newPictureFile) {
                promises.push(api.post("/user/remove-picture"));
            } else if (newPictureFile) {
                const picData = new FormData();
                picData.append("picture", newPictureFile);
                promises.push(api.patch("/user/update-picture", picData));
            }

            const originalVisibility = user.profileVisibility === "private";
            if (isPrivate !== originalVisibility) {
                promises.push(api.post("/user/change-visibility"));
            }

            await Promise.all(promises);

            dispatch(fetchCurrentUser());
            onClose();
            alert("Profile updated successfully!");

        } catch (err) {
            console.error("Update failed", err);

            alert(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3>Edit Profile</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="edit-picture-section">
                        <img src={preview} alt="Profile" className="edit-avatar" />
                        <div className="picture-actions">
                            <button className="change-pic-btn" onClick={() => fileInputRef.current.click()}>
                                Change Profile Photo
                            </button>
                            {(preview !== noProfile) && (
                                <button className="remove-pic-btn" onClick={handleRemovePicture}>
                                    Remove Current Photo
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="edit-form">
                        <div className="form-group">
                            <label>First Name</label>
                            <input name="firstName" value={formData.firstName} onChange={handleTextChange} />
                        </div>
                        <div className="form-group">
                            <label>Middle Name</label>
                            <input name="middleName" value={formData.middleName} onChange={handleTextChange} />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input name="lastName" value={formData.lastName} onChange={handleTextChange} />
                        </div>
                        <div className="form-group">
                            <label>Username</label>
                            <input name="username" value={formData.username} onChange={handleTextChange} />
                        </div>
                         <div className="form-group">
                            <label>Email</label>
                            <input name="email" value={formData.email} onChange={handleTextChange} />
                        </div>
                        <div className="form-group">
                            <label>Occupation</label>
                            <textarea 
                                name="occupation" 
                                value={formData.occupation} 
                                onChange={handleTextChange}
                                placeholder="Bio"
                                rows={2}
                            />
                        </div>
                         <div className="form-group">
                            <label>Location</label>
                            <input name="location" value={formData.location} onChange={handleTextChange} />
                        </div>
                    </div>

                    <div className="privacy-section">
                        <div className="privacy-info">
                            <h4>Private Account</h4>
                            <p>When your account is private, only people you approve can see your photos and videos.</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={isPrivate} 
                                onChange={(e) => setIsPrivate(e.target.checked)} 
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="save-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}