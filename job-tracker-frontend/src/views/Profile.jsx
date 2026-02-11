import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/profile")
      .then(res => setProfile(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await API.put("/profile", profile);
      setProfile(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-accent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500 dark:text-red-400">
        Profile not found. Please contact support.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your personal information and bio.
          </p>
        </div>

        {!editing && (
          <button
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={!editing}
              value={profile.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={!editing}
              value={profile.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={!editing}
              value={profile.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            disabled={!editing}
            value={profile.bio ?? ""}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Write a short bio about yourself"
            rows={4}
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
