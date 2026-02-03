import { useState, useEffect } from "react";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import {
  getPartyProfile,
  updatePartyProfile,
} from "../../services/partyService";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    manifesto: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPartyProfile();
        setProfile(res.data);
        setForm({
          manifesto: res.data?.manifesto || "",
          description: res.data?.description || "",
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
      alert("Profile updated successfully!");
      setEditing(false);
      // Refresh profile
      const res = await getPartyProfile();
      setProfile(res.data);
    } catch (err) {
      alert(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading)
    return (
      <div className="page-content">
        <p>Loading...</p>
      </div>
    );
  if (!profile)
    return (
      <div className="page-content">
        <p>No profile data</p>
      </div>
    );

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Party Profile</h1>
        <p>Manage your party information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2>{profile?.name}</h2>
          <p className="text-muted">{profile?.description}</p>
        </Card>

        <Card>
          <h3>Manifesto</h3>
          {editing ? (
            <div className="form-group">
              <textarea
                value={form.manifesto}
                onChange={(e) =>
                  setForm({ ...form, manifesto: e.target.value })
                }
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p>{form.manifesto}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
