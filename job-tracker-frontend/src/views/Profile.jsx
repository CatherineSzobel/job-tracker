import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Pencil } from "lucide-react";
import API from "../api/axios";
import { showToast } from "../stores/useToastStore";
import Avatar from "../components/UI/Avatar";
import PageHeader from "../components/UI/PageHeader";
import PageLoader from "../components/UI/PageLoader";

const TEXT_FIELDS = [
  { key: "name", label: "Name", placeholder: "Your name" },
  { key: "title", label: "Title", placeholder: "Frontend Developer" },
  { key: "location", label: "Location", placeholder: "City, Country" },
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  // The profile as saved, so Cancel can put it back
  const [savedProfile, setSavedProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/profile")
      .then(res => {
        setProfile(res.data.data);
        setSavedProfile(res.data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const cancelEditing = () => {
    setProfile(savedProfile);
    setEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/profile", profile);
      setProfile(res.data.data);
      setSavedProfile(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading profile..." />;
  }

  if (!profile) {
    return <p className="text-danger">Profile not found. Please contact support.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6">
      <PageHeader
        title="Profile"
        description={
          <>
            How you introduce yourself. Email and password live in{" "}
            <Link to="/settings" className="font-semibold text-accent-text hover:underline">
              Settings
            </Link>
            .
          </>
        }
        actions={
          !editing && (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              <Pencil size={16} aria-hidden="true" />
              Edit profile
            </button>
          )
        }
      />

      {editing ? (
        <form onSubmit={saveProfile} aria-label="Edit profile" className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 md:p-8">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-6 gap-y-4">
            {TEXT_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label htmlFor={`profile-${key}`} className="input-label">
                  {label}
                </label>
                <input
                  id={`profile-${key}`}
                  className="input-field"
                  value={profile[key] ?? ""}
                  onChange={(e) => updateField(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="profile-bio" className="input-label">
              Bio
            </label>
            <textarea
              id="profile-bio"
              className="input-field resize-y"
              value={profile.bio ?? ""}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Write a short bio about yourself"
              rows={5}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-subtle pt-4">
            <button type="button" className="btn-secondary" onClick={cancelEditing} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <section aria-label="Your profile" className="flex flex-wrap items-start gap-6 rounded-2xl border border-line bg-surface p-6 md:p-8">
          <Avatar name={profile.name} size="lg" />
          <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-2">
            <h2 className="text-2xl/8 font-bold break-words">{profile.name || "Your name"}</h2>
            {profile.title && <p className="font-semibold text-accent-text">{profile.title}</p>}
            {profile.location && (
              <p className="inline-flex items-center gap-1.5 text-muted">
                <MapPin size={16} aria-hidden="true" />
                {profile.location}
              </p>
            )}
            {profile.bio ? (
              <p className="mt-2 max-w-[60ch] whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="mt-2 text-muted">No bio yet. Use Edit profile to add one.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
