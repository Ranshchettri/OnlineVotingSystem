import { useState, useEffect } from "react";
import { getPartyProfile, updatePartyProfile } from "../services/partyService";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    description: "",
    manifesto: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPartyProfile();
        setProfile(res.data);
        setForm({
          description: res.data?.description || "",
          manifesto: res.data?.manifesto || [],
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await updatePartyProfile(form);
      alert("Profile updated!");
      setEditing(false);
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (!profile)
    return (
      <div>
        <p>No data</p>
      </div>
    );
  return (
    <div>
      <h2>Party Profile</h2>

      <p>{profile?.description}</p>

      <h3>Manifesto</h3>
      <ul>
        {Array.isArray(profile?.manifesto) &&
          profile.manifesto.map((m, i) => <li key={i}>{m}</li>)}
      </ul>

      <button onClick={() => setEditing(true)}>Edit Profile</button>

      {editing && (
        <div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}

      <p className="note">⚠ Core details controlled by Election Commission</p>
    </div>
  );
}
