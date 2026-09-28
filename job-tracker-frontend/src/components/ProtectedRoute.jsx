import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import PageLoader from "./UI/PageLoader";

export default function ProtectedRoute({ children }) {

  const user = useAuthStore((state) => state.user);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // The persisted user may belong to an expired session; wait for the server to confirm it
  if (!sessionChecked) {
    return <PageLoader />;
  }

  return children;
}
