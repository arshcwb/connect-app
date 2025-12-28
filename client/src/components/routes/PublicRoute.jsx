import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    if (loading) return null; 

    if (isAuthenticated) {
        return <Navigate to="/home" />;
    }

    return children;
}

export default PublicRoute;