// components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import Footer from "../Footer";

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
