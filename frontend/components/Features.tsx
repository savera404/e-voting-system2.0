const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: "Military-Grade Security",
    description: "End-to-end encryption with vote verification ensures every ballot is tamper-proof and anonymous.",
    tag: " Encrypted",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Real-Time Results",
    description: "Watch election results unfold live with constituency-level breakdowns updated every 30 seconds.",
    tag: "Live Dashboard",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "NADRA Verified Identity",
    description: "Seamless integration with NADRA's CNIC database ensures one person, one vote — always.",
    tag: "CNIC Integration",
  },

  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    title: "Vote from Anywhere",
    description: "Desktop, mobile, or tablet — cast your vote from home, office, or abroad with equal ease.",
    tag: "Cross-Platform",
  },

];

export default function Features() {
  return (
    <section id="features" className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block text-[#1a4731] text-sm font-semibold tracking-widest uppercase mb-3">Why PakVote</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Built for Pakistan's <br className="hidden md:block" />Democracy
          </h2>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
            Every feature is designed with security, accessibility, and trust at its core.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#1a4731]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1a4731]/8 text-[#1a4731] flex items-center justify-center mb-5 group-hover:bg-[#1a4731] group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-gray-900 text-lg leading-snug">{feature.title}</h3>
                <span className="shrink-0 text-xs font-medium text-[#1a4731] bg-[#1a4731]/8 px-2.5 py-1 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}