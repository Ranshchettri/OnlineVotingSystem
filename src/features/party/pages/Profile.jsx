import { useState } from "react";
import { partyProfile } from "../mock/party.mock";
import Card from "../../../shared/ui/Card";
import Button from "../../../shared/ui/Button";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    manifesto: partyProfile.manifesto,
    description: partyProfile.description,
  });

  const handleSave = () => {
    // Mock save
    setEditing(false);
    alert("Profile updated (mock)");
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Party Profile</h1>
        <p>Manage your party information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2>{partyProfile.name}</h2>
          <p className="text-muted">{partyProfile.description}</p>
        </Card>

        <Card>
          <h3>Manifesto</h3>
          {editing ? (
            <div className="form-group">
              <textarea
                value={form.manifesto}
                onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <p>{form.manifesto}</p>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
