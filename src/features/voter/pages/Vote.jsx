import { useState } from "react";
import { parties } from "../mock/voter.mock";
import PartyCard from "../components/PartyCard";
import Card from "../../../shared/ui/Card";
import Button from "../../../shared/ui/Button";

export default function Vote() {
  const [selected, setSelected] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const handleConfirmVote = () => {
    if (!selected) return alert("Select a party first");
    setShowOTP(true);
  };

  const handleSubmitVote = () => {
    if (!otp || otp.length !== 6) return alert("Enter 6-digit OTP");
    alert(
      `Vote submitted for: ${parties.find((p) => p.id === selected)?.name} (mock)`,
    );
    setShowOTP(false);
  };

  if (showOTP) {
    return (
      <div className="page-content">
        <Card className="otp-modal">
          <h2>OTP Verification</h2>
          <p>Enter the 6-digit code sent to your email</p>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="otp-input"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmitVote}>Submit Vote</Button>
            <Button variant="secondary" onClick={() => setShowOTP(false)}>
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Cast Your Vote</h1>
        <p>Select your preferred party</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {parties.map((p) => (
          <PartyCard
            key={p.id}
            party={p}
            isSelected={selected === p.id}
            onSelect={() => setSelected(p.id)}
          />
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Button disabled={!selected} onClick={handleConfirmVote}>
          Confirm & Send OTP
        </Button>
      </div>
    </div>
  );
}
