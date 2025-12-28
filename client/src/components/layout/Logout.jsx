import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";
import "../../css/Logout.css"

export default function LogoutButton() {
  const dispatch = useDispatch();


  
  return (
    <button className="logout-btn">
      Logout
    </button>
  );
}