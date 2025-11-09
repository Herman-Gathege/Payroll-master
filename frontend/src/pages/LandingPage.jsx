import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-light-gray">
      <Navbar />

      {/* 🦸 Hero Section */}
      <header className="hero">
        <h1>Become a Certified Evolve Agent</h1>
        <p>
          Join our network of university student agents earning while promoting
          digital business solutions that empower small enterprises across
          Kenya.
        </p>
        <div className="hero-buttons">
          <Link
            to="/agent/onboarding/register"
            className="btn-primary mr-4"
            style={{ marginRight: "1rem" }}
          >
            Get Started
          </Link>
          <Link
            to="/agent/login"
            className="btn-outline-1"
            style={{ marginRight: "1rem" }}
          >
            Agent Login
          </Link>
          {/* <Link to="/login" className="btn-outline-1">
            Employer Login
          </Link> */}
        </div>
      </header>

      {/* 🌟 Why Work With Us */}
      <section className="section">
        <h2>Why Work With Evolve?</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2rem",
            marginTop: "2rem",
            textAlign: "left",
          }}
        >
          {[
            {
              title: "Earn While You Learn",
              desc: "University students earn commissions for every client they onboard while gaining hands-on sales and tech experience.",
            },
            {
              title: "Growth & Mentorship",
              desc: "Access training sessions, mentorship, and networking opportunities from professionals in tech and business.",
            },
            {
              title: "Flexible & Rewarding",
              desc: "Work at your own pace, on your schedule — and get recognized for your performance through our reward programs.",
            },
          ].map((item) => (
            <div key={item.title} className="card" style={{ padding: "2rem" }}>
              <h3 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
                {item.title}
              </h3>
              <p style={{ color: "var(--gray)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⚙️ How It Works / Our Services */}
      <section className="section" style={{ background: "var(--light-gray)" }}>
        <h2>How It Works</h2>
        <p>
          Your journey as an Evolve Agent is simple, transparent, and
          results-driven.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            marginTop: "2.5rem",
          }}
        >
          {[
            {
              step: "1",
              title: "Register Online",
              desc: "Complete a quick onboarding form and upload your documents for verification.",
            },
            {
              step: "2",
              title: "Get Verified",
              desc: "Once approved, you’ll gain access to your personal Agent Dashboard.",
            },
            {
              step: "3",
              title: "Start Selling",
              desc: "Use your dashboard tools to track clients, sales, and commissions easily.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="card"
              style={{
                padding: "2rem",
                width: "300px",
                textAlign: "center",
              }}
            >
              <div
                className="step-circle step-active"
                style={{
                  margin: "0 auto 1rem",
                  fontSize: "1.2rem",
                  width: "50px",
                  height: "50px",
                }}
              >
                {s.step}
              </div>
              <h3 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>
                {s.title}
              </h3>
              <p style={{ color: "var(--gray)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💬 Testimonials */}
      <section className="section">
        <h2>What Our Agents Say</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {[
            {
              name: "Brian, UoN",
              quote:
                "Evolve helped me gain real experience while earning extra income. The mentorship and resources are top-notch!",
            },
            {
              name: "Vanessa, KU",
              quote:
                "The onboarding process was simple and transparent. I love being part of a tech-driven community.",
            },
            {
              name: "Ian, Strathmore",
              quote:
                "Working as an agent fits perfectly with my studies. The dashboard makes tracking my progress easy and motivating.",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="card"
              style={{
                padding: "2rem",
                textAlign: "left",
                background: "var(--light)",
              }}
            >
              <p
                style={{
                  fontStyle: "italic",
                  marginBottom: "1rem",
                  color: "var(--gray)",
                }}
              >
                “{t.quote}”
              </p>
              <h4 style={{ color: "var(--primary)" }}>— {t.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* 🌍 Footer */}
      <footer style={{ background: "var(--primary)", color: "var(--light)" }}>
        <div style={{ padding: "2rem 1rem" }}>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--secondary)" }}>
            Evolve Systems
          </h3>
          <p style={{ margin: "0 auto", maxWidth: "600px" }}>
            Empowering the next generation of digital ambassadors through
            opportunity, mentorship, and innovation.
          </p>

          <div style={{ marginTop: "1rem" }}>
            <Link
              to="/agent/onboarding/register"
              className="btn-primary"
              style={{
                background: "var(--secondary)",
                color: "var(--accent)",
                fontWeight: "600",
              }}
            >
              Join Now
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "#0f223e",
            padding: "1rem 0",
            fontSize: "0.9rem",
          }}
        >
          © {new Date().getFullYear()} Evolve Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
