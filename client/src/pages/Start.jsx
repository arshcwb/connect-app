import { useNavigate } from "react-router-dom"
import "../css/Start.css"

export default function Start() {
    const navigate = useNavigate()

    return (
        <div className="start-page">
            <div className="container">
                <div className="logo">
                    <h1>Connect</h1>
                </div>
                <div className="intro">
                    <p>This app is an social media clone like Instagram. Please register if you are first time user, or login if you've already an account.</p>
                </div>
            </div>
            
            <div className="start-buttons">
            <button onClick={() => navigate("/login")}>
                Login
            </button>

            <button onClick={() => navigate("/register")}>
                Register
            </button>
            </div>
        </div>
    )
}
