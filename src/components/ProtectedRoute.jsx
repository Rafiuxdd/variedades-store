import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, permission, isLoggedIn, currentUser }) {
  if (!isLoggedIn) {
    return <Navigate to="/panel" replace />;
  }

  if (permission && !currentUser?.permissions?.[permission]) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
