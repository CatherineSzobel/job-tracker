import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch current user
    useEffect(() => {
        API.get("/user")
            .then(res => setUser(res.data))
            .catch(err => {
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
                    localStorage.removeItem("token"); // optional if using token
                    navigate("/login");
                })
                .catch(err => console.error(err));
        } else {
            navigate(`/${value}`);
        }

        // Reset select back to placeholder after click
        e.target.value = "";
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">

                {/* LEFT SIDE - Logo + Main Nav */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-lg font-bold">
                        Job Tracker
                    </Link>

                    <div className="flex gap-4 text-sm">
                        <Link to="/" className="hover:text-gray-300">
                            Dashboard
                        </Link>

                        <Link to="/applications" className="hover:text-gray-300">
                            Applications
                        </Link>

                        <Link to="/interviews" className="hover:text-gray-300">
                            Interviews
                        </Link>

                        <Link to="/calendar" className="hover:text-gray-300">
                            Calendar
                        </Link>
                    </div>
                </div>

                {user ? (
                    <div className="flex items-center gap-3">
                        <p className="text-sm">Welcome, {user.name}</p>

                        <select
                            onChange={handleMenuChange}
                            defaultValue=""
                            className="text-sm text-black p-1 rounded"
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
                        <Link to="/register" className="hover:text-gray-300">
                            Register
                        </Link>

                        <Link to="/login" className="hover:text-gray-300">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
