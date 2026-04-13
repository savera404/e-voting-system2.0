"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, saveAdminAuth } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(email, password);
      if (ok) {
        saveAdminAuth();
        router.push("/admin/elections");
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1f17] px-4">
      {/* subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md">
        {/* card */}
        <div className="bg-[#162b1e] border border-[#2a4a36] rounded-3xl shadow-2xl shadow-black/40 p-8">

          {/* logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">PakVote</p>
              <p className="text-xs text-[#22c55e] font-semibold tracking-widest uppercase">Admin Portal</p>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Admin Sign In</h1>
          <p className="text-sm text-gray-400 mb-7">Restricted access — authorized personnel only.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-sm text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pakvote.gov.pk" required
                className="w-full px-4 py-3 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm
                  placeholder-gray-600 outline-none transition-all
                  focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password" required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm
                    placeholder-gray-600 outline-none transition-all
                    focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#22c55e] transition-colors">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-[#22c55e] text-[#0a1a10] font-bold text-sm
                shadow-lg shadow-[#22c55e]/20 hover:-translate-y-0.5 hover:bg-[#16a34a] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
              {loading ? "Verifying…" : "Sign In to Admin Panel →"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Not an admin?{" "}
            <a href="/login" className="text-[#22c55e] hover:underline font-semibold">Voter login →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
