"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginVoter, saveAuth } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginVoter(email, password);
      saveAuth(data.access_token, data.voter_id, data.name);
      router.push("/vote");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7f5] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-green-900/10 p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-[#1a4a2e] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-black text-[#1a4a2e]">PakVote</span>
        </div>

        <h1 className="text-2xl font-black text-[#1a4a2e] mb-1">Welcome back</h1>
        <p className="text-sm text-gray-800 mb-7">Sign in to access your voter portal.</p>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-green-100 bg-white text-gray-800
                text-sm placeholder-gray-300 outline-none transition-all
                focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-green-100 bg-white text-gray-800
                  text-sm placeholder-gray-300 outline-none transition-all
                  focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
              />
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
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-xs font-semibold text-[#1a4a2e] hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1a4a2e]
              text-white font-semibold text-sm shadow-lg shadow-green-900/25
              hover:-translate-y-0.5 hover:shadow-xl transition-all
              disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-sm text-[#1a4a2e] mt-6">
          Don&apos;t have an account?{" "}
          <button onClick={() => router.push("/signup")} className="font-bold text-green-800 hover:underline">
            Register to Vote
          </button>
        </p>
      </div>
    </div>
  );
}
