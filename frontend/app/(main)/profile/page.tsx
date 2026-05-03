"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getVoterProfile, getConstituency, type VoterResponse, type ConstituencyResponse } from "../../../lib/api";

const G      = "#1a4731";
const GL     = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG     = "#f7faf8";

function InfoCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: BG, borderColor: BORDER }}>
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold" style={{ color: color ?? "#0f1f17" }}>{value}</p>
    </div>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const [voter,        setVoter]        = useState<VoterResponse | null>(null);
  const [fedCons,      setFedCons]      = useState<ConstituencyResponse | null>(null);
  const [provCons,     setProvCons]     = useState<ConstituencyResponse | null>(null);
  const [localCons,    setLocalCons]    = useState<ConstituencyResponse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    getVoterProfile()
      .then(async (v) => {
        setVoter(v);
        // Fetch all three constituencies in parallel — only request those that exist
        const [fed, prov, local] = await Promise.all([
          v.federal_constituency_id    ? getConstituency(v.federal_constituency_id)    : Promise.resolve(null),
          v.provincial_constituency_id ? getConstituency(v.provincial_constituency_id) : Promise.resolve(null),
          v.local_constituency_id      ? getConstituency(v.local_constituency_id)      : Promise.resolve(null),
        ]);
        setFedCons(fed);
        setProvCons(prov);
        setLocalCons(local);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Initials from name
  const initials = voter?.name
    ? voter.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  // Vote status summary
  const voteTypes = [
    { label: "Federal",    done: voter?.has_voted_federal    ?? false },
    { label: "Provincial", done: voter?.has_voted_provincial ?? false },
    { label: "Local",      done: voter?.has_voted_local      ?? false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: BG }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: `${G}33`, borderTopColor: G }} />
      </div>
    );
  }

  if (error || !voter) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-red-500" style={{ background: BG }}>
        {error ?? "Could not load profile."}
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.25)" }}>
            {initials}
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
              {voter.name}
            </h1>
            <p className="text-white/60 text-sm">{voter.email}</p>
          </div>
        </div>
      </section>

      <div className="px-4 lg:px-8 py-10" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* Personal Information */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <h2 className="font-bold text-lg text-gray-900 mb-6" style={{ fontFamily: "Georgia, serif" }}>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  ["Full Name",    voter.name],
                  ["Email",        voter.email],
                  ["CNIC",         voter.cnic],
                  ["Nationality",  "Pakistani"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Registration Details */}
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <h2 className="font-bold text-lg text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>
                Voter Registration Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCell label="Registration Status" value="Active" color="#16a34a" />
                <InfoCell
                  label="Federal Constituency (NA)"
                  value={fedCons ? fedCons.name : voter.federal_constituency_id ? "Loading…" : "Not registered"}
                />
                <InfoCell
                  label="Provincial Constituency"
                  value={provCons ? provCons.name : voter.provincial_constituency_id ? "Loading…" : "Not registered"}
                />
                <InfoCell
                  label="Local Constituency"
                  value={localCons ? localCons.name : voter.local_constituency_id ? "Loading…" : "Not registered"}
                />
              </div>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* NADRA Verified card */}
            <div className="rounded-2xl px-6 py-5 text-white" style={{ background: G }}>
              <p className="font-bold text-lg flex items-center gap-2 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                NADRA Verified
              </p>
              <p className="text-sm text-white/65 leading-relaxed mb-4">
                Your identity has been verified against NADRA records.
              </p>
              {[["NADRA Status", "Confirmed"], ["Biometric", "Completed"]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-white/10 text-sm last:border-0">
                  <span className="text-white/55">{l}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>

            {/* Voting Status card */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: BORDER }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Voting Status</p>
              <div className="flex flex-col gap-2">
                {voteTypes.map(({ label, done }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm"
                    style={{
                      borderColor: done ? "#86efac" : BORDER,
                      background:  done ? "#f0fdf4" : BG,
                    }}>
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-bold text-xs" style={{ color: done ? "#16a34a" : "#9ca3af" }}>
                      {done ? "✓ Voted" : "Not yet"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
