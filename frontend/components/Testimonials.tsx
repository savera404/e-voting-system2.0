const testimonials = [
  {
    quote:
      "PakVote made it possible for millions of overseas Pakistanis to participate in our democracy for the first time. The verification process is airtight.",
    name: "Dr. Ayesha Raza",
    role: "Political Analyst, Islamabad",
    initials: "AR",
  },
  {
    quote:
      "As a returning officer, I can say the audit trail PakVote provides is far superior to any paper-based system we've used in previous elections.",
    name: "Muhammad Tariq",
    role: "Returning Officer, Lahore",
    initials: "MT",
  },
  {
    quote:
      "Voted from London in under 4 minutes. The Urdu interface and CNIC verification made the whole process seamless and trustworthy.",
    name: "Sana Mirza",
    role: "Pakistani Diaspora, UK",
    initials: "SM",
  },
];

const partners = [
  { name: "Election Commission\nof Pakistan", abbr: "ECP" },
  { name: "National Database &\nRegistration Authority", abbr: "NADRA" },
  { name: "Pakistan\nTelecommunication Authority", abbr: "PTA" },
  { name: "Ministry of\nInformation Technology", abbr: "MoIT" },
  { name: "Federal Board\nof Revenue", abbr: "FBR" },
];

export default function Testimonials() {
  return (
    <>
      {/* Partners / Endorsed by */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-10">
            Endorsed & Integrated With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {partners.map((p) => (
              <div key={p.abbr} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#1a4731]/8 flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#1a4731]">{p.abbr}</span>
                </div>
                <span className="text-xs text-gray-500 leading-tight whitespace-pre-line font-medium">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-[#1a4731] text-sm font-semibold tracking-widest uppercase mb-3">
              Trusted By Citizens
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
              What People Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote mark */}
                <svg className="w-8 h-8 text-[#1a4731]/15 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.96.76-3.022.66-1.06 1.515-1.876 2.558-2.449L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.01.66-1.06 1.514-1.876 2.557-2.449L18.496 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003z" />
                </svg>

                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>

                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-[#1a4731] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}