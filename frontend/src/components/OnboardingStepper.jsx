import React from "react";

export default function OnboardingStepper({ step }) {
  const steps = ["Register", "Profile", "Documents"];

  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((label, index) => {
        const current = index + 1;
        const active = step >= current;

        return (
          <div key={label} className="flex flex-col items-center text-center w-1/3">
            <div className={`step-circle ${active ? "step-active" : ""}`}>{current}</div>
            <p className={`step-label ${active ? "step-label-active" : ""}`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}
