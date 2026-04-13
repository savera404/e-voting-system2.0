"use client";

import { useState } from "react";

const G = "#1a4731";
const GL = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG = "#f7faf8";

export default function MyProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState("Ahmed Ali");
  const [email,   setEmail]   = useState("ahmed.ali@email.com");
  const [phone,   setPhone]   = useState("+92 300 1234567");

  return (
    <>
      {/* Hero */}
      {/* <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.25)" }}
          >
            AA
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-4xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                {name}
              </h1>
             
            </div>
            <p className="text-white/60 text-sm">NA-123 Islamabad</p>
          </div>
        </div>
      </section> */}

      <div className="px-4 lg:px-8 py-10" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left */}
          <div className="flex flex-col gap-5">

            {/* Personal Info */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
                  Personal Information
                </h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: editing ? G : GL, color: editing ? "#fff" : G }}
                >
                  {editing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  ["Full Name",      name,                  setName,  true ],
                  ["Email Address",  email,                 setEmail, true ],
                  ["Phone Number",   phone,                 setPhone, true ],
                  ["CNIC",           "35202-1234567-8",     null,     false],
                  ["Date of Birth",  "Jan 15, 1985",        null,     false],
                  ["Nationality",    "Pakistani",           null,     false],
                ].map(([label, value, setter, editable]) => (
                  <div key={String(label)}>
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                      {label}
                    </label>
                    {editing && editable && setter ? (
                      <input
                        value={value as string}
                        onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none bg-gray-50"
                        style={{ borderColor: BORDER }}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{value as string}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Registration */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <h2 className="font-bold text-lg text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>
                Voter Registration Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["Voter ID",          "VTR-2025-123456",  G      ],
                  ["Registration Date", "Mar 12, 2023",     null   ],
                  ["Constituency",      "NA-123 Islamabad", null   ],
                  ["Province",          "ICT",              null   ],
                  ["Polling Station",   "F-7/2 School No.1",null   ],
                  ["Status",            "Active",           "#16a34a"],
                ].map(([l, v, c]) => (
                  <div
                    key={String(l)}
                    className="rounded-xl p-4 border"
                    style={{ background: BG, borderColor: BORDER }}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{l}</p>
                    <p className="text-sm font-bold" style={{ color: (c as string) ?? "#0f1f17" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <h2 className="font-bold text-lg text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>
                Account Security
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Password",               value: "Last changed 3 months ago",       action: "Change Password" },
                  { label: "Two-Factor Authentication", value: "Enabled via SMS OTP",            action: "Manage 2FA"      },
                  { label: "Linked Devices",           value: "2 active sessions",              action: "View Devices"    },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{ borderColor: BORDER, background: BG }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.value}</p>
                    </div>
                    <button
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: GL, color: G }}
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Verification card */}
            <div className="rounded-2xl px-6 text-white" style={{ background: G }}>
              <div className="w-12 h-auto rounded-full bg-white/15 flex items-center justify-center mb-4">
                
              </div>
        <p className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
  <svg width="22" height="22" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
  NADRA Verified
</p>
              <p className="text-sm text-white/65  leading-relaxed">
              
                Your identity has been verified against NADRA records.
              </p>
              {[["Verified On","Mar 12, 2023"],["NADRA Status","Confirmed"],["Biometric","Completed"]].map(([l,v])=>(
                <div key={l} className="flex justify-between py-2 border-b border-white/10 text-sm last:border-0 m">
                  <span className="text-white/55">{l}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>

   
          </div>
        </div>
      </div>
    </>
  );
}