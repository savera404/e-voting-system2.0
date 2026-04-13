export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Platform: ["Register to Vote", "Cast Your Vote", "Live Results", "Verify Result"],
    Support: ["Help Center", "Contact Us", "Report Issue", "Accessibility"],
    Legal: ["Privacy Policy", "Terms of Service", "Security Policy", "Transparency Report"],
    Government: ["ECP Pakistan", "NADRA", "Official Elections", "Press Releases"],
  };

  return (
    <footer className="bg-[#0f2d1e] text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <svg width="18" height="18" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">PakVote</span>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Pakistan's official digital voting platform. Secure, transparent, and accessible elections for every citizen.
            </p>
            <div className="mt-6 flex gap-3">
              {/* Social Icons */}
              {[
                { label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "Youtube", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#2d7a4f] hover:border-[#2d7a4f] transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Badge Row */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Certifications */}
            <div className="flex flex-wrap items-center gap-4">
              {[
                { icon: "🔒", label: "Encrypted" },
                { icon: "🛡️", label: "ISO 27001 Certified" },
                { icon: "✅", label: "ECP Approved Platform" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center md:text-right">
              © {currentYear} PakVote — Election Commission of Pakistan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}