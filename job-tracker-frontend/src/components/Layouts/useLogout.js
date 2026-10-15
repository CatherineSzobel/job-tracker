import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

// Logs out, then shows the landing page (what "/" shows a visitor who isn't logged in)
export default function useLogout() {
  const logout = useAuthStore((state) => state.logoutAction);
  const navigate = useNavigate();

  return async () => {
    await logout();
    navigate("/");
  };
}
