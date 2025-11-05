import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAgent } from "../../services/agentService";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", full_name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await registerAgent(form);
      if (response.success) {
        setRegistered(true);
        console.log("Navigating to /agent/onboarding/profile with ID:", response.agent_id);

        // Navigate to profile step and pass agent_id
        navigate("/agent/onboarding/profile", {
          state: { agent_id: response.agent_id },
        });
      } else {
        setError(response.message || "Failed to register agent.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--light-gray)", minHeight: "100vh" }}>
      <div className="form-card">
        <OnboardingStepper step={1} />
        <h2>Agent Registration</h2>

        {!registered ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Continue Onboarding"}
            </button>

            {error && (
              <p className="form-message" style={{ color: "red" }}>
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="form-message" style={{ textAlign: "center" }}>
            <p style={{ color: "green", fontWeight: 600, fontSize: "16px" }}>
              Registration successful 🎉
            </p>
            <p style={{ color: "#555" }}>Redirecting to profile setup...</p>
          </div>
        )}
      </div>
    </div>
  );
}
