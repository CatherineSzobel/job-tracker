import { useEffect, useState } from "react";
import API from "../api/axios";
import ProfileLinks from "../components/ProfileLinks";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile
  useEffect(() => {
    API.get("/profile")
      .then(res => {
        setProfile(res.data.data); // assume profile exists
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value,
    }));
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
      <div className="p-6 text-gray-500">Loading profile...</div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500">
        Profile not found. Please contact support.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="text-sm text-gray-500">
            Manage how your profile.
          </p>
        </div>

        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              className="input"
              disabled={!editing}
              value={profile.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              className="input"
              disabled={!editing}
              value={profile.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              className="input"
              disabled={!editing}
              value={profile.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            className="textarea"
            disabled={!editing}
            value={profile.bio ?? ""}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Write a short bio about yourself"
            rows={4}
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              className="btn"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
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
