import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import PhoneBar from "../PhoneBar";

// Phones/tablets: PhoneBar on top. Desktop (lg+): Sidebar beside the page and Navbar above it.
// Page content is capped at 1280px and centred.
function Layout() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      {/* min-w-0 lets wide children shrink instead of pushing the page sideways */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PhoneBar />
        <Navbar />
        <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
