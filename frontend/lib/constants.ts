
// DESIGN PATTERN: Single Source of Truth + Factory Pattern
// All app-wide data lives here. Components never hard-code these values.
// Factory functions produce config objects on demand.


export const COLORS = {
  primary:    "#1a4731",
  primaryLight: "#f0f7f3",
  border:     "#e5ebe7",
  bg:         "#f7faf8",
} as const;

// ── FACTORY PATTERN 
// Instead of switch/if-else scattered across components, one factory returns
// the right config object. Add a new status → edit ONE place.
export type ElectionStatus = "live" | "upcoming" | "scheduled";
export type StatusConfig = { bg: string; color: string; label: string; pulse: boolean };

export function createStatusConfig(status: ElectionStatus): StatusConfig {
  const map: Record<ElectionStatus, StatusConfig> = {
    live:      { bg: "#fef2f2", color: "#ef4444", label: "LIVE NOW",  pulse: true  },
    upcoming:  { bg: "#fffbeb", color: "#d97706", label: "UPCOMING",  pulse: false },
    scheduled: { bg: "#eff6ff", color: "#3b82f6", label: "SCHEDULED", pulse: false },
  };
  return map[status];
}

export const PARTY_COLORS: Record<string, string> = {
  PTI:         "#c41e3a",
  "PML-N":     "#1a4731",
  PPP:         "#1a1a1a",
  MQM:         "#b45309",
  "JUI-F":     "#6366f1",
  Independent: "#6b7280",
  "Ind.":      "#9ca3af",
};

// ── FACTORY PATTERN
export function createPartyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#9ca3af";
}

// ── SINGLE SOURCE OF TRUTH
export type Candidate = {
  id: number; name: string; party: string; sym: string;
  age: number; pct: number; inc: boolean;
  edu: string; cons: string; bio: string; color: string;
};

export const CANDIDATES: Candidate[] = [
  { id:1, name:"Ahmad Raza Khan",    party:"PTI",         sym:"🦅", age:52, pct:32, inc:true,  color:"#c41e3a", edu:"LLB, Punjab University",    cons:"NA-123 Islamabad", bio:"Former federal minister and three-term MNA with extensive legislative experience in infrastructure and education reform committees." },
  { id:2, name:"Bilal Hussain Shah", party:"PML-N",       sym:"⚡", age:47, pct:28, inc:false, color:"#1a4731", edu:"MBA, IBA Karachi",           cons:"NA-123 Islamabad", bio:"Prominent business leader and development advocate. Founder of multiple social enterprises across Punjab, focused on youth employment." },
  { id:3, name:"Sadia Malik",        party:"PPP",         sym:"🏹", age:44, pct:24, inc:false, color:"#1a1a1a", edu:"MBBS, King Edward Medical",  cons:"NA-123 Islamabad", bio:"Physician turned politician championing healthcare reforms and maternal health policy since 2018. Former WHO Pakistan advisor." },
  { id:4, name:"Farooq Ahmed Niazi", party:"MQM",         sym:"🔑", age:58, pct:10, inc:false, color:"#b45309", edu:"BE Civil, NED University",   cons:"NA-123 Islamabad", bio:"Civil engineer and urban development specialist with 20 years in project management." },
  { id:5, name:"Zainab Qadir",       party:"JUI-F",       sym:"📖", age:39, pct:4,  inc:false, color:"#6366f1", edu:"MA Political Science, QAU", cons:"NA-123 Islamabad", bio:"Community organizer and women's rights activist leading grassroots mobilization in rural constituencies since 2015." },
  { id:6, name:"Tariq Mehmood",      party:"Independent", sym:"🌟", age:61, pct:2,  inc:false, color:"#6b7280", edu:"MBA, Quaid-e-Azam Univ.",   cons:"NA-123 Islamabad", bio:"Local business owner and longstanding community council leader focused on trade and small enterprise development." },
];

export const PARTY_FILTER_OPTIONS = ["All", "PTI", "PML-N", "PPP", "MQM", "JUI-F", "Independent"];
export const CONTACT_TOPICS = ["Voting Assistance","Registration Issue","Technical Problem","Vote Verification","Results Query","Account & Security","Other"];
export const FAQ_CATEGORIES  = ["All","Voting","Registration","Security","Technical","Results"];

export type FAQ = { id: number; cat: string; q: string; a: string };
export const FAQS: FAQ[] = [
  { id:1,  cat:"Registration", q:"How do I register to vote on PakVote?",              a:"Visit pakvote.gov.pk and click 'Register to Vote'. You'll need your CNIC number and registered mobile phone. NADRA will verify your identity automatically within minutes." },
  { id:2,  cat:"Registration", q:"Who is eligible to vote?",                            a:"Any Pakistani citizen aged 18 or above with a valid CNIC is eligible. You must also be registered with NADRA and not be disqualified under any court order." },
  { id:3,  cat:"Voting",       q:"How do I cast my vote on election day?",              a:"Log in with your CNIC and OTP on election day. Select your constituency, review candidate profiles, select your choice, and confirm. You'll receive a cryptographic receipt ID." },
  { id:4,  cat:"Voting",       q:"Can I change my vote after submission?",              a:"No. Once your vote is confirmed and submitted, it is final and cannot be changed. This ensures the integrity of the election process." },
  { id:5,  cat:"Voting",       q:"What if the platform is down on election day?",       a:"ECP maintains 99.99% uptime SLA with redundant servers across 5 data centres. Physical polling stations remain available as a backup option." },
  { id:6,  cat:"Security",     q:"Is my vote anonymous?",                               a:"Yes. Votes are anonymized before storage using zero-knowledge proofs. Even ECP administrators cannot link your identity to your specific vote." },
  { id:7,  cat:"Security",     q:"How is the system protected from hacking?",           a:"We use military-grade 256-bit AES encryption, multi-factor authentication, DDoS protection, and a distributed blockchain ledger. The system is audited by independent cybersecurity firms." },
  { id:8,  cat:"Security",     q:"What is the cryptographic receipt?",                  a:"After voting, you receive a unique hash ID tied to an anonymized record on the ECP blockchain. You can use it to verify your vote was counted without revealing your selection." },
  { id:9,  cat:"Technical",    q:"Which devices and browsers are supported?",           a:"PakVote works on all modern browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile. An official mobile app is available on iOS and Android." },
  { id:10, cat:"Technical",    q:"What if I don't receive my OTP?",                     a:"Check that your mobile number matches your CNIC registration. If the issue persists, call 0800-PAKVOTE or visit your nearest NADRA office." },
  { id:11, cat:"Results",      q:"When are election results published?",                a:"Preliminary results are published live as constituency counts are completed. Official certified results are published within 48 hours of polling closing." },
  { id:12, cat:"Results",      q:"How can I verify the election results are accurate?", a:"All constituency results are cryptographically signed and published on the ECP public ledger. Independent observers can audit any constituency result using the published hash chain." },
];