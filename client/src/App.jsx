import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentUser, fetchUserLikes } from "./features/auth/authSlice"

import Start from "./pages/Start"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/routes/ProtectedRoute"
import PublicRoute from "./components/routes/PublicRoute"
import { fetchMyFriends, fetchSentRequests } from "./features/friend/friendSlice"


export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyFriends())
      dispatch(fetchUserLikes())
      dispatch(fetchSentRequests())
    }
  }, [dispatch, isAuthenticated])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        
        {/* Guest */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Authenticated */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
              <Profile />
          </ProtectedRoute>
        } 
        />
      </Routes>
    </BrowserRouter>
  )
}
