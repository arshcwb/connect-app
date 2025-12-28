import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, resetError } from "../features/auth/authSlice"
import { Link, useNavigate } from "react-router-dom"
import "../css/Login.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { loading, error, isAuthenticated } = useSelector(state => state.auth)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value)
    if (error) dispatch(resetError())
  }

  const handleLogin = async () => {
    dispatch(loginUser({ email, username, password }))
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home")
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="login-page">
      <h2>Login</h2>
      <p className="instruction">Please enter your credentials. Either email or username, along with password</p>
      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      <div className="fields">
        <input
          placeholder="Email"
          value={email}
          onChange={handleInputChange(setEmail)}
        />
        <input
          placeholder="Username"
          value={username}
          onChange={handleInputChange(setUsername)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange(setPassword)}
        />

      </div>
      
      <div className="login-buttons">
         <button 
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
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