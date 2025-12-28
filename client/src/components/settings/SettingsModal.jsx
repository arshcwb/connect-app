import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";

import { logoutUser } from "../../features/auth/authSlice"; 

import "../../css/SettingsModal.css"; 

export default function SettingsModal({ onClose, onEditProfile }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [view, setView] = useState("menu"); 
    const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [deletePass, setDeletePass] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePasswordStrength = (password) => {
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters long";

        let hasLetter = /[a-zA-Z]/.test(password);
        let hasNumber = /[0-9]/.test(password);
        let hasSymbol = /[^a-zA-Z0-9]/.test(password);

        if (!hasLetter) return "Password must contain at least one letter";
        if (!hasNumber) return "Password must contain at least one number";
        if (!hasSymbol) return "Password must contain at least one symbol";
        
        return null;
    };

    const handleChangePassword = async () => {
        const { oldPassword, newPassword, confirmPassword } = passData;

        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("All fields are required");
            return;
        }
        if (oldPassword === newPassword) {
            alert("New password must be different from old password");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("New Password doesn't match");
            return;
        }
        const error = validatePasswordStrength(newPassword);
        if (error) {
            alert(error);
            return;
        }

        setLoading(true);
        try {
            await api.post("/user/change-password", passData);
            alert("Password changed successfully");
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePass) {
            alert("Please enter your password to confirm");
            return;
        }
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        
        setLoading(true);
        try {
            await api.post("/user/delete", { password: deletePass });
            await dispatch(logoutUser()).unwrap(); 
            navigate("/login"); 
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete account");
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch(view) {
            case "password":
                return (
                    <div className="settings-sub-page">
                        <h3>Change Password</h3>
                        <input 
                            type="password" placeholder="Old Password"
                            value={passData.oldPassword} 
                            onChange={e => setPassData({...passData, oldPassword: e.target.value})} 
                        />
                        <input 
                            type="password" placeholder="New Password"
                            value={passData.newPassword} 
                            onChange={e => setPassData({...passData, newPassword: e.target.value})} 
                        />
                        <input 
                            type="password" placeholder="Confirm New Password"
                            value={passData.confirmPassword} 
                            onChange={e => setPassData({...passData, confirmPassword: e.target.value})} 
                        />
                        <div className="sub-actions">
                            <button className="back-btn" onClick={() => setView("menu")}>Back</button>
                            <button className="confirm-btn" onClick={handleChangePassword} disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>
                );
            case "delete":
                return (
                    <div className="settings-sub-page">
                        <h3 className="danger-text">Delete Account</h3>
                        <p>Please enter your password to confirm deletion.</p>
                        <input 
                            type="password" placeholder="Current Password"
                            value={deletePass}
                            onChange={e => setDeletePass(e.target.value)}
                        />
                        <div className="sub-actions">
                            <button className="back-btn" onClick={() => setView("menu")}>Back</button>
                            <button className="delete-confirm-btn" onClick={handleDeleteAccount} disabled={loading}>
                                {loading ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="settings-menu">
                        <h3>Settings</h3>
                        <div className="setting-item" onClick={() => { onClose(); onEditProfile(); }}>
                            <span>Edit Profile</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                        <div className="setting-item" onClick={() => setView("password")}>
                            <span>Change Password</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                        <div className="setting-item danger" onClick={() => setView("delete")}>
                            <span>Delete Profile</span>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </div>
                        {/* <div className="setting-item logout" onClick={handleLogout}>
                            <span>Log Out</span>
                        </div> */}
                    </div>
                );
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn-abs" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                {renderContent()}
            </div>
        </div>
    );
}