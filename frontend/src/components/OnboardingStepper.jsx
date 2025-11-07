import React from "react";

export default function OnboardingStepper({ step }) {
  const steps = ["Register", "Profile", "Documents"];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2.5rem",
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        marginInline: "auto",
      }}
    >
      {/* Progress Line */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "10%",
          width: "80%",
          height: "3px",
          backgroundColor: "var(--light-gray)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "10%",
          width: `${((step - 1) / (steps.length - 1)) * 80}%`,
          height: "3px",
          backgroundColor: "var(--secondary)",
          zIndex: 1,
          transition: "var(--transition)",
        }}
      />

      {/* Step Circles */}
      {steps.map((label, index) => {
        const current = index + 1;
        const active = step >= current;
        const isCurrent = step === current;

        return (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "33%",
              zIndex: 2,
            }}
          >
            <div
              className="step-circle"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                color: active ? "var(--light)" : "var(--gray)",
                backgroundColor: active
                  ? isCurrent
                    ? "var(--secondary)"
                    : "var(--primary)"
                  : "transparent",
                border: `2px solid ${
                  active ? "var(--primary)" : "var(--gray)"
                }`,
                boxShadow: active ? "0 3px 8px rgba(26, 54, 93, 0.2)" : "none",
                transition: "var(--transition)",
              }}
            >
              {current}
            </div>
            <p
              className="step-label"
              style={{
                marginTop: "0.6rem",
                fontSize: "0.9rem",
                color: active ? "var(--primary)" : "var(--gray)",
                fontWeight: active ? "600" : "400",
                transition: "var(--transition)",
              }}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
