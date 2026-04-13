export default function VoteConfirmation() {
  return (
    <section className="py-5 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text Content */}
          <div>
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#1a4731]/10 flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a4731" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <span className="inline-block text-[#1a4731] text-sm font-semibold tracking-widest uppercase mb-3">
              Tamper-Proof Voting
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6">
              Secure Vote <br />Confirmation
            </h2>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
              Our system ensures your vote is cast exactly as intended. Review your choices before final submission and receive a digital receipt with a unique hash reference ID for full transparency.
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {[
                "Double-confirmation step before submission",
                "Cryptographic Receipt ID for every vote",
                "Anonymized Data Storage — your identity stays private",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1a4731] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Receipt Card */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#1a4731]/8 blur-3xl" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              {/* Success icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-[#1a4731]/10 border-4 border-[#1a4731]/20 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a4731" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-7">
                <h3 className="text-xl font-black text-gray-900 mb-1">Vote Cast Successfully!</h3>
                <p className="text-sm text-gray-400">Thank you for exercising your right.</p>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Election", value: "NA-125 General" },
                  { label: "Date", value: "Oct 24, 2026" },
                  { label: "Time", value: "14:30 PKT" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Reference ID box */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">Reference ID</p>
                <p className="text-sm font-mono font-bold text-[#1a4731] tracking-wide">8f7d-22a1-99c0-x772</p>
              </div>

              {/* Button */}
              <button className="w-full bg-[#1a4731] hover:bg-[#15392a] text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group">
                <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Receipt
              </button>

              {/* Footer note */}
              <p className="text-center text-xs text-gray-400 mt-4">
                Keep this receipt to verify your vote on the ECP portal
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}