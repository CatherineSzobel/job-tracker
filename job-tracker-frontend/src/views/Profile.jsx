import { useEffect, useState } from "react";
import API from "../api/axios";
import { showToast } from "../stores/useToastStore";
import PageLoader from "../components/UI/PageLoader";

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
      showToast("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading profile..."/>
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500 dark:text-red-400">
        Profile not found. Please contact support.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-10 sm:px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Profile</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Manage your personal information and bio.
          </p>
        </div>

        {!editing && (
          <button
            className="px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="input-label">
              Name
            </label>
            <input
              className="input-field"
              disabled={!editing}
              value={profile.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="input-label">
              Title
            </label>
            <input
              className="input-field"
              disabled={!editing}
              value={profile.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Frontend Developer"
            />
          </div>

          <div>
            <label className="input-label">
              Location
            </label>
            <input
              className="input-field"
              disabled={!editing}
              value={profile.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="input-label">
            Bio
          </label>
          <textarea
            className="input-field resize-none"
            disabled={!editing}
            value={profile.bio ?? ""}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Write a short bio about yourself"
            rows={4}
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-subtle">
            <button
              className="px-4 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-muted hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition"
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
