export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#1a4731] flex items-center justify-center overflow-hidden">
      {/* Background decorative arcs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-white/5" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full bg-[#15392a]/60" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] aspect-square rounded-full bg-[#1f5538]/40" />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
       

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-[70px] font-black text-white leading-[1.02] tracking-tight mb-8">
          Your Voice,
          <br />
          Your Future.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-12">
          A secure, transparent, and accessible digital voting platform designed for the people of Pakistan. Register, review ballots, and cast your vote from anywhere.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#1a4731] font-bold text-base px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
          >
            Get Started
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-white/50 text-sm">
          {["2.4M+ Registered Voters", "Bank-Grade Security", "Real-Time Results", "ECP Certified"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}