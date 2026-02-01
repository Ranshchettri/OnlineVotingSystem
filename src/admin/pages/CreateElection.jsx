import { useState } from "react";
import api from "../../services/api";
import "../styles/createElection.css";

export default function CreateElection() {
  const [form, setForm] = useState({
    title: "",
    type: "political",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!form.title.trim()) {
      setError("Election title is required");
      return;
    }
    if (!form.startDate) {
      setError("Start date is required");
      return;
    }
    if (!form.endDate) {
      setError("End date is required");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      await api.post("/elections", form);
      setSuccess(true);
      setForm({ title: "", type: "political", startDate: "", endDate: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to create election:", err);
      console.error("Error response:", err.response?.data);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create election";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-election">
      <div className="form-container">
        <h2>Create Election</h2>
        <p className="form-subtitle">Set up a new election for voters</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Election created successfully! Email notifications are being sent.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Election Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., General Election 2026"
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Election Type *</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="political">Political</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                id="endDate"
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? "Creating..." : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
