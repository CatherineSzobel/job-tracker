import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layouts/Layout";
import AuthLayout from "./components/Layouts/AuthLayout";

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

function App() {
  return (
    <Routes>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="jobs/:id" element={<Application />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="links" element={<Links />} />
        <Route path="settings" element={<Settings />} />
        <Route path="archives" element={<Archive />} />
      </Route>

      <Route path="*" element={<p className="text-center mt-10">Page not found</p>} />
    </Routes>
  );
}

export default App;
