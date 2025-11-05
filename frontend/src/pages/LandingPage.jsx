import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-light-gray">
      <Navbar />

      <header className="hero">
        <h1>Empowering Agents with Seamless Onboarding</h1>
        <p>
          Join Evolve’s growing network of agents and streamline your onboarding
          process — from registration to verification, all in one place.
        </p>
        <div className="hero-buttons">
          <Link to="/agent/onboarding/register" className="btn-primary mr-4">
            Get Started
          </Link>
          <Link to="/login" className="btn-outline">
            Login
          </Link>
        </div>
      </header>

      <section className="section">
        <h2>Why Join Evolve?</h2>
        <p>
          Experience fast, transparent onboarding and become part of an
          ecosystem that values growth, trust, and performance. Manage your
          documents, profile, and training all from one dashboard.
        </p>
      </section>

      <section className="section" style={{ background: "var(--light-gray)" }}>
        <h2>Integrated Tools</h2>
        <p>
          The Evolve Agent Portal connects seamlessly to Payroll, CRM, and
          Reporting modules, giving you total control over your professional
          journey.
        </p>
      </section>

      <footer>
        © {new Date().getFullYear()} Evolve Systems. All rights reserved.
      </footer>
    </div>
  );
}
