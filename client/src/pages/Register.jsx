import { useState } from "react"
import api from "../services/api"
import { Link, useNavigate } from "react-router-dom"
import "../css/Register.css"

export default function Register() {
  const [form, setForm] = useState({})
  const [picture, setPicture] = useState(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })
      if (picture) formData.append("picture", picture)

      await api.post("/user/register", formData)
      
      setIsRegistered(true)
    } catch (error) {
      console.error("Error:", error)
      alert("Registration failed.")
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isRegistered) {
    return (
      <div className="registration-success">
        <div className="message">
          <h3>Registration Successful!</h3>
        </div>
        <div className="login-btn">
          <button onClick={() => navigate("/login")}>Go to Login</button>  
        </div>
        
      </div>
    )
  }

  return (
    <div className="register-page">
        <h2>Register</h2>
        
        <p className="instruction">Please enter all * marked fields to register</p>
        
        <div className="fields">
            <input placeholder="Username*" onChange={e => setForm({ ...form, username: e.target.value })} />
            <input placeholder="Email*" onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password*" onChange={e => setForm({ ...form, password: e.target.value })} />
            <input placeholder="First Name*" onChange={e => setForm({ ...form, firstName: e.target.value })} />
            <input placeholder="Middle Name" onChange={e => setForm({ ...form, middleName: e.target.value })} />
            <input placeholder="Last Name" onChange={e => setForm({ ...form, lastName: e.target.value })} />
            <input placeholder="Location" onChange={e => setForm({ ...form, location: e.target.value })} />
            <input placeholder="Occupation" onChange={e => setForm({ ...form, occupation: e.target.value })} />
        </div>

        <div className="upload-wrapper">
            <label className="upload-label" style={{ cursor: "pointer" }}>
               
                <div className="upload-btn-fake" style={{
                    backgroundColor: "#efefef", 
                    padding: "5px 10px", 
                    border: "1px solid #767676", 
                    borderRadius: "2px",
                    display: "inline-block",
                    fontSize: "13.33px",
                    textAlign: "center"
                }}>
                    Choose Profile Picture
                </div>

                <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => setPicture(e.target.files[0])}
                />
            </label>
            <p className="file-name">
                {picture ? picture.name : "No file chosen"}
            </p>
        </div>

        <div className="register-buttons">
            <button onClick={handleRegister} disabled={isLoading}>
                {isLoading ? "Creating..." : "Register"}
            </button>
            <Link to="/">
                <button>
                    Home
                </button>
            </Link>
        </div>
    </div>
  )
}