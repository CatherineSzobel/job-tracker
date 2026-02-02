import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch current user
    useEffect(() => {
        API.get("/user")
            .then((res) => setUser(res.data))
            .catch((err) => {
                console.error(err);
                setUser(null);
            });
    }, []);

    // Handle menu selection
    const handleMenuChange = (e) => {
        const value = e.target.value;

        if (value === "logout") {
            API.post("/logout")
                .then(() => {
                    setUser(null);
                    localStorage.removeItem("token");
                    navigate("/login");
                })
                .catch((err) => console.error(err));
        } else {
            navigate(`/${value}`);
        }

        e.target.value = "";
    };

    return (
        <nav className="bg-primary-soft text-surface p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                {/* LEFT SIDE - Logo + Nav Links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-lg font-bold hover:text-accent">
                        Job Tracker
                    </Link>

                    <div className="flex gap-4 text-sm">
                        <Link to="/" className="hover:text-accent-soft">
                            Dashboard
                        </Link>

                        <Link to="/applications" className="hover:text-accent-soft">
                            Applications
                        </Link>

                        <Link to="/interviews" className="hover:text-accent-soft">
                            Interviews
                        </Link>

                        <Link to="/calendar" className="hover:text-accent-soft">
                            Calendar
                        </Link>
                    </div>
                </div>

                {/* RIGHT SIDE - User / Auth */}
                {user ? (
                    <div className="flex items-center gap-3">
                        <p className="text-sm">{`Welcome, ${user.name}`}</p>

                        <select
                            onChange={handleMenuChange}
                            defaultValue=""
                            className="text-sm rounded border border-border p-1 bg-surface text-primary hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                            <option value="" disabled>
                                Menu
                            </option>
                            <option value="profile">Profile</option>
                            <option value="links">Links</option>
                            <option value="settings">Settings</option>
                            <option value="logout">Logout</option>
                        </select>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 text-sm">
                        <Link to="/register" className="hover:text-accent-soft">
                            Register
                        </Link>

                        <Link to="/login" className="hover:text-accent-soft">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
