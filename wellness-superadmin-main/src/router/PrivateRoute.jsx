import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        return <Navigate to="/sign-in" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;