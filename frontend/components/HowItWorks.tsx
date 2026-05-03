const steps = [
  {
    number: "01",
    title: "Register Your CNIC",
    description: "Create your account using your National Identity Card number. ",
  },
  {
    number: "02",
    title: "Login",
    description: "Login using your email and password.",
  },
  {
    number: "03",
    title: "Review Your Ballot",
    description: "View candidates for your constituency, read their profiles, and make an informed choice.",
  },
  {
    number: "04",
    title: "Cast & Confirm",
    description: "Submit your vote with a single tap.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 mt-0 items-center">
          {/* Left: Text */}
          <div>
          
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-3">
              Vote in 4 <br />Simple Steps
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-10">
              PakVote is designed to be as simple as possible. If you can use a mobile app, you can vote. No polling station queues. No lost ballots.
            </p>
          </div>

          {/* Right: Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-5 group">
                {/* Number + connector */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#1a4731]/8 border-2 border-[#1a4731]/20 flex items-center justify-center font-black text-[#1a4731] text-sm group-hover:bg-[#1a4731] group-hover:text-white group-hover:border-[#1a4731] transition-all duration-300 shrink-0">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full mt-2 bg-gradient-to-b from-[#1a4731]/20 to-transparent" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}