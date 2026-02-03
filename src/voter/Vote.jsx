import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Vote() {
  const [parties, setParties] = useState([]);
  const [selected, setSelected] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    axios.get("/voter/parties").then((res) => {
      const data = res.data?.data || res.data;
      setParties(Array.isArray(data) ? data : []);
    });
  }, []);

  const requestOTP = async () => {
    if (!selected) return alert("Select a party");
    try {
      await axios.post("/voter/vote-request-otp", {
        partyId: selected,
      });
      localStorage.setItem("voteParty", selected);
      nav("/voter/vote-otp");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request OTP");
    }
  };

  return (
    <div>
      <h2>Cast Your Vote</h2>

      <div className="grid">
        {parties.map((p) => (
          <div
            key={p._id}
            className={`card ${selected === p._id ? "active" : ""}`}
            onClick={() => setSelected(p._id)}
          >
            {p.logo && <img src={p.logo} width="60" alt={p.name} />}
            <h3>{p.name}</h3>
          </div>
        ))}
      </div>

      <button
        onClick={requestOTP}
        className="btn btn-primary"
        style={{ marginTop: "1rem" }}
      >
        Confirm & Send OTP
      </button>
    </div>
  );
}
