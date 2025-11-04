// src/pages/AgentOnboarding/AgentRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAgent } from "../../services/agentService";
import OnboardingStepper from "../../components/OnboardingStepper";
import { useAuth } from "../../contexts/AuthContext";

export default function AgentRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");

  const handleBackendRegister = async () => {
    if (!user) {
      setError("Please log in first to continue onboarding.");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      action: "register",
      email: user.email,
      username: user.username || user.email,
      full_name: user.full_name || "",
    };

    try {
      const response = await registerAgent(data);
      if (response.success) {
        setRegistered(true);
        setTimeout(() => navigate("/agent/onboarding/profile"), 1500);
      } else {
        setError(response.message || "Failed to register agent. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <OnboardingStepper step={1} />
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Agent Registration
        </h2>

        {!user ? (
          <>
            <p className="text-gray-500 text-center mb-4">
              Please log in or create your account to begin onboarding.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-3">
              Welcome, <span className="font-medium">{user.email}</span>!
            </p>
            <button
              onClick={handleBackendRegister}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? "Registering..." : "Continue Onboarding"}
            </button>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}
          </>
        )}

        {registered && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium mb-3">
              Registration successful 🎉
            </p>
            <a
              href="/agent/onboarding/profile"
              className="text-indigo-600 hover:underline"
            >
              Proceed to Complete Profile →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
