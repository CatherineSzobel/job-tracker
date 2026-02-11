// components/AuthLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AuthLayout;
