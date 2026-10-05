// components/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ConfirmDialog from "../UI/ConfirmDialog";
import Toaster from "../UI/Toaster";

// Phones/tablets: the sidebar's top bar sits above the page. Desktop (lg+): sidebar beside it.
function Layout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      {/* min-w-0 lets wide children shrink instead of pushing the page sideways */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="flex-1 p-3 sm:p-6">
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster />
      <ConfirmDialog />
    </div>
  );
}

export default Layout;
