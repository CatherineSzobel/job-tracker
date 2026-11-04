import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layouts/Layout";
import AuthLayout from "./components/Layouts/AuthLayout";
import ConfirmDialog from "./components/UI/ConfirmDialog";
import Toaster from "./components/UI/Toaster";
import PageLoader from "./components/UI/PageLoader";

// Views, each in its own chunk so a page only loads its own code
const Register = lazy(() => import("./views/Register"));
const Login = lazy(() => import("./views/Login"));
const Dashboard = lazy(() => import("./views/Dashboard"));
const Applications = lazy(() => import("./views/Applications"));
const Interviews = lazy(() => import("./views/Interviews"));
const Interview = lazy(() => import("./views/Interview"));
const QuestionBank = lazy(() => import("./views/QuestionBank"));
const Calendar = lazy(() => import("./views/Calendar"));
const Profile = lazy(() => import("./views/Profile"));
const Documents = lazy(() => import("./views/Documents"));
const Settings = lazy(() => import("./views/Settings"));
const Application = lazy(() => import("./views/Application"));
const Archive = lazy(() => import("./views/Archive"));
const Todos = lazy(() => import("./views/Todos"));
const Landing = lazy(() => import("./views/Landing"));

function App() {

  const checkSession = useAuthStore(state => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])
  return (
    <>
    <Suspense fallback={<PageLoader />}>
    <Routes>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/*"
        element={
          <ProtectedRoute guestHome={<Landing />}>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="interviews/:id" element={<Interview />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="jobs/:id" element={<Application />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="todos" element={<Todos />} />
        <Route path="profile" element={<Profile />} />
        <Route path="documents" element={<Documents />} />
        <Route path="links" element={<Navigate to="/documents" replace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="archives" element={<Archive />} />
      </Route>

      <Route path="*" element={<p className="text-center mt-10">Page not found</p>} />
    </Routes>
    </Suspense>

    {/* Toasts and confirm dialogs work on every page: the app, login/register and the landing page */}
    <Toaster />
    <ConfirmDialog />
    </>
  );
}

export default App;