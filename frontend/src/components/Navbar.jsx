import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 3rem",
        background: "var(--light)",
        boxShadow: "var(--shadow)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo / Brand */}
      <Link
        to="/"
        className="text-xl font-semibold"
        style={{
          color: "var(--primary)",
          fontSize: "1.4rem",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textDecoration: "none",
        }}
      >
        Evolve Portal
      </Link>

      {/* Navigation Links */}
      <div
        className="nav-links"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <Link
          to="/"
          style={{
            color: "var(--gray)",
            textDecoration: "none",
            fontWeight: 500,
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--gray)")}
        >
          Home
        </Link>

        <Link
          to="/agent/onboarding/register"
          style={{
            color: "var(--gray)",
            textDecoration: "none",
            fontWeight: 500,
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => (e.target.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--gray)")}
        >
          Become an Agent
        </Link>

        <Link
          to="/login"
          style={{
            color: "var(--secondary)",
            textDecoration: "none",
            fontWeight: 600,
            border: "1px solid var(--secondary)",
            borderRadius: "var(--radius)",
            padding: "0.5rem 1.2rem",
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--secondary)";
            e.target.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "var(--secondary)";
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
