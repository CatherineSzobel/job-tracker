import { useEffect, useState } from "react";
import API from "../api/axios";

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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        {!editing && (
          <button
            className="btn"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        <input
          className="input"
          disabled={!editing}
          value={profile.name ?? ""}
          onChange={e => updateField("name", e.target.value)}
          placeholder="Name"
        />

        <input
          className="input"
          disabled={!editing}
          value={profile.title ?? ""}
          onChange={e => updateField("title", e.target.value)}
          placeholder="Title (e.g. Frontend Developer)"
        />

        <input
          className="input"
          disabled={!editing}
          value={profile.location ?? ""}
          onChange={e => updateField("location", e.target.value)}
          placeholder="Location"
        />

        <textarea
          className="textarea"
          disabled={!editing}
          value={profile.bio ?? ""}
          onChange={e => updateField("bio", e.target.value)}
          placeholder="Short bio"
          rows={4}
        />
      </div>

      {/* Save / Cancel */}
      {editing && (
        <div className="flex gap-2 mt-6">
          <button
            className="btn btn-primary"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="btn"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
