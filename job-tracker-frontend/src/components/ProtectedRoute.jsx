import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import PageLoader from "./UI/PageLoader";

// The app's pages need a logged-in user. A visitor who isn't logged in gets guestHome at "/" (the
// landing page) and the login page everywhere else. A remembered user waits for the server to
// confirm the session first, so a logged-in reload of "/" never flashes the landing page.
export default function ProtectedRoute({ children, guestHome = null }) {

  const user = useAuthStore((state) => state.user);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);
  const location = useLocation();

  if (!user) {
    if (guestHome && location.pathname === "/") {
      return guestHome;
    }
    return <Navigate to="/login" replace />;
  }

  // The persisted user may belong to an expired session; wait for the server to confirm it
  if (!sessionChecked) {
    return <PageLoader />;
  }

  return children;
}
