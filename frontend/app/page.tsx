// import { redirect } from "next/navigation";

// export default function Home() {
//   redirect("/login");
// }

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import VoteConfirmation from "@/components/VoteConfirmation";
export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <VoteConfirmation />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}