"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerVoter, listConstituencies, type ConstituencyResponse } from "../../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Constituency dropdown state
  const [constituencies, setConstituencies] = useState<ConstituencyResponse[]>([]);
  const [constLoading, setConstLoading]     = useState(false);

  const [form, setForm] = useState({
    name: "",
    father_or_husband_name: "",
    email: "",
    phone: "",
    password: "",
    cnic: "",
    constituency_id: "",   // stored as string from select, cast to int on submit
    agreeTerms: false,
  });

  // Load constituencies once when step 2 mounts
  useEffect(() => {
    if (step === 2 && constituencies.length === 0) {
      setConstLoading(true);
      listConstituencies()
        .then(setConstituencies)
        .catch(() => setConstituencies([]))
        .finally(() => setConstLoading(false));
    }
  }, [step, constituencies.length]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCNIC = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 5)  v = v.slice(0, 5)  + "-" + v.slice(5);
    if (v.length > 13) v = v.slice(0, 13) + "-" + v.slice(13, 14);
    setForm({ ...form, cnic: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1 → Step 2
    if (step === 1) {
      setStep(2);
      return;
    }

    // Final submit
    if (!form.constituency_id) {
      setError("Please select a constituency.");
      return;
    }

    setLoading(true);
    try {
      await registerVoter({
        name:                   form.name,
        father_or_husband_name: form.father_or_husband_name,
        cnic:                   form.cnic,
        phone_number:           form.phone || undefined,
        email:                  form.email,
        password:               form.password,
        constituency_id:        Number(form.constituency_id),
      });
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = !form.password ? null
    : form.password.length < 6  ? { label: "Weak",     bar: "w-1/4 bg-red-500",    text: "text-red-500"    }
    : form.password.length < 10 ? { label: "Moderate", bar: "w-2/3 bg-yellow-400", text: "text-yellow-500" }
    :                              { label: "Strong",   bar: "w-full bg-green-500", text: "text-green-600"  };

  const inputClass  = "w-full px-4 py-3 rounded-xl border-2 border-green-100 bg-white text-gray-950 text-sm placeholder-gray-300 outline-none transition-all focus:border-green-700 focus:ring-2 focus:ring-green-700/10";
  const labelClass  = "block text-sm font-semibold text-gray-800 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7f5] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-green-900/10 p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div className="w-9 h-9 bg-[#1a4a2e] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-black text-green-900">PakVote</span>
        </div>

        <h1 className="text-2xl font-black text-green-950 mb-1">
          {step === 1 ? "Create account" : "Verify identity"}
        </h1>
        <p className="text-sm text-gray-800 mb-5">
          {step === 1 ? "Register as a verified voter." : "Enter your CNIC and constituency."}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-7">
          {["Account", "Verification"].map((label, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${step >= n ? "bg-[#1a4a2e] text-white" : "bg-green-100 text-green-400"}`}>
                  {step > n ? "✓" : n}
                </div>
                <span className={`text-xs font-medium ${step === n ? "text-green-900" : "text-green-400"}`}>{label}</span>
                {i === 0 && <div className={`flex-1 h-0.5 rounded ${step > 1 ? "bg-green-500" : "bg-green-100"}`} />}
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Step 1: Account details ── */}
          {step === 1 && (
            <>
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handle}
                  placeholder="As per your CNIC" required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Father / Husband Name <span className="text-red-500">*</span></label>
                <input name="father_or_husband_name" value={form.father_or_husband_name} onChange={handle}
                  placeholder="As per your CNIC" required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@email.com" required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={handle}
                  placeholder="03XX-XXXXXXX" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" type={showPass ? "text" : "password"}
                    value={form.password} onChange={handle}
                    placeholder="Min. 8 characters" required
                    className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a4a2e] hover:text-green-700 transition-colors">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      {showPass
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                        : <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                      }
                    </svg>
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1 bg-green-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.bar}`} />
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${strength.text}`}>{strength.label}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Step 2: Verification ── */}
          {step === 2 && (
            <>
              <div>
                <label className={labelClass}>CNIC Number <span className="text-red-500">*</span></label>
                <input name="cnic" value={form.cnic} onChange={handleCNIC}
                  placeholder="XXXXX-XXXXXXX-X" maxLength={15} required className={inputClass} />
                <p className="text-xs text-green-400 mt-1">Format: 42101-1234567-9</p>
              </div>

              <div>
                <label className={labelClass}>Constituency <span className="text-red-500">*</span></label>
                {constLoading ? (
                  <div className="w-full px-4 py-3 rounded-xl border-2 border-green-100 bg-white text-sm text-gray-400">
                    Loading constituencies…
                  </div>
                ) : (
                  <select
                    name="constituency_id"
                    value={form.constituency_id}
                    onChange={handle}
                    required
                    className={inputClass}
                  >
                    <option value="">Select your constituency</option>
                    {constituencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.type ? ` (${c.type})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {!constLoading && constituencies.length === 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    Could not load constituencies. Please ensure the backend is running.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" name="agreeTerms" checked={form.agreeTerms}
                  onChange={handle} required
                  className="mt-0.5 w-4 h-4 accent-green-700 cursor-pointer shrink-0" />
                <p className="text-xs text-gray-800 leading-relaxed">
                  I confirm all information is accurate and I agree to the{" "}
                  <a href="#" className="font-bold text-green-800 hover:underline">Terms</a> &{" "}
                  <a href="#" className="font-bold text-green-800 hover:underline">Privacy Policy</a>.
                </p>
              </div>

              <button type="button" onClick={() => { setError(null); setStep(1); }}
                className="w-full py-3 rounded-xl border-2 border-green-200 bg-white
                  text-green-800 font-semibold text-sm hover:border-green-600 hover:bg-green-50 transition-all">
                ← Back
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1a4a2e]
              text-white font-semibold text-sm shadow-lg shadow-green-900/25
              hover:-translate-y-0.5 hover:shadow-xl transition-all
              disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {step === 1 ? "Continue →" : loading ? "Registering…" : "Complete Registration ✓"}
          </button>
        </form>

        <p className="text-center text-sm text-[#1a4a2e] mt-6">
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} className="font-bold text-green-800 hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
