// App.jsx
import { Routes, Route } from "react-router-dom"; // <-- NO BrowserRouter here
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Views
import Register from "./views/Register";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Applications from "./views/Applications";
import Interviews from "./views/Interviews";
import Calendar from "./views/Calendar";
import Profile from "./views/Profile";
import Links from "./views/Links";
import Settings from "./views/Settings";
import Application from "./views/Application";
import Archive from "./views/Archive";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><Application /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/archives" element={<ProtectedRoute><Archive /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<p className="text-center mt-10">Page not found</p>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;


