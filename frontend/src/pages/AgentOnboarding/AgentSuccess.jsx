import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // optional: npm i lucide-react
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 9000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
        <OnboardingStepper step={3} />
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Onboarding Complete 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for completing your onboarding. Our team will review your
          documents shortly. You’ll receive an email once your account is
          verified.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
