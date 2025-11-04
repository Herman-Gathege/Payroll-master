// // src/components/OnboardingStepper.jsx
// import React from "react";

// export default function OnboardingStepper({ step = 1 }) {
//   const steps = [
//     "Register",
//     "Complete Profile",
//     "Upload Documents",
//     "Verification",
//   ];

//   return (
//     <div className="flex justify-between items-center mb-6">
//       {steps.map((label, index) => {
//         const active = index + 1 <= step;
//         return (
//           <div key={index} className="flex-1 text-center">
//             <div
//               className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full border-2 ${
//                 active
//                   ? "bg-indigo-600 text-white border-indigo-600"
//                   : "border-gray-300 text-gray-400"
//               }`}
//             >
//               {index + 1}
//             </div>
//             <p
//               className={`mt-2 text-sm ${
//                 active ? "text-indigo-600" : "text-gray-400"
//               }`}
//             >
//               {label}
//             </p>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// src/components/OnboardingStepper.jsx
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
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                active ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 text-gray-400"
              }`}
            >
              {current}
            </div>
            <p
              className={`mt-2 text-sm ${
                active ? "text-indigo-600 font-medium" : "text-gray-500"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
