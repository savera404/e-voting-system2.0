const stats = [
  { value: "2.4M+", label: "Registered Voters" },
  { value: "99.9%", label: "System Uptime" },
  { value: "4", label: "Provinces Covered" },
  { value: "<2s", label: "Vote Processing Time" },
];

export default function CTA() {
  return (
    <>


      {/* CTA section */}
      <section id="register" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-12 md:p-16">
            <div className="w-16 h-16 rounded-2xl bg-[#1a4731]/10 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a4731" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-5">
              Ready to Make <br />Your Vote Count?
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
              Registration takes less than 3 minutes. All you need is your CNIC and a smartphone.
            </p>
            <p className="mt-6 text-xs text-gray-400">
              By registering, you agree to our Terms of Service and Privacy Policy. Your data is protected under PECA 2016.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}