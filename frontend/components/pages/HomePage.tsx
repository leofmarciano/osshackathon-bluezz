import Hero from "../home/Hero";
import Problem from "../home/Problem";
import Solution from "../home/Solution";
import HowItWorks from "../home/HowItWorks";
import Differentials from "../home/Differentials";
import Manifesto from "../home/Manifesto";
import Governance from "../home/Governance";
import Community from "../home/Community";
import FinalCTA from "../home/FinalCTA";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Differentials />
      <Manifesto />
      <Governance />
      <Community />
      <FinalCTA />
    </div>
  );
}
