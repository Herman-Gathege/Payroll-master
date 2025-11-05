import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="text-xl font-semibold" style={{ color: "var(--primary)" }}>
        Evolve Portal
      </Link>

      <div className="space-x-6">
        <Link to="/" style={{ color: "var(--gray)" }}>
          Home
        </Link>
        <Link to="/agent/onboarding/register" style={{ color: "var(--gray)" }}>
          Become an Agent
        </Link>
        <Link
          to="/login"
          style={{
            color: "var(--secondary)",
            fontWeight: 500,
            transition: "var(--transition)",
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
