import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAgent } from "../../services/agentService";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+254",
    phone: "",
  });
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
      // Combine first + last name before sending to backend
      const full_name = `${form.first_name.trim()} ${form.last_name.trim()}`;
      const formattedPhone = `${form.country_code}${form.phone.replace(/^0+/, "")}`;

      const response = await registerAgent({
        full_name,
        email: form.email,
        phone: formattedPhone,
      });

      if (response.success) {
        setRegistered(true);
        console.log("Navigating to /agent/onboarding/profile with ID:", response.agent_id);

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
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", marginTop: "10px" }}>
              <select
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                style={{ width: "100px", padding: "8px" }}
              >
                <option value="+254">🇰🇪 +254</option>
                <option value="+255">🇹🇿 +255</option>
                <option value="+256">🇺🇬 +256</option>
                <option value="+250">🇷🇼 +250</option>
                <option value="+1">🇺🇸 +1</option>
              </select>

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
            </div>

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
