import Footer from "./Component/layout/Footer";
import Navbar from "./Component/layout/Navbar";
import About from "./Component/Section/About";
import Awareness from "./Component/Section/Awareness";
import HeroHome from "./Component/Section/HeroHome";
import HowItWorks from "./Component/Section/HowItWorks";
import Service from "./Component/Section/Service";
import WhyChooseUs from "./Component/Section/WhyChooseUs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50">
      <div className="flex flex-col gap-4">
        <Navbar />
        <HeroHome />
      </div>
      <main className="flex flex-col gap-10 sm:gap-14 my-8">
        <About />
        <WhyChooseUs />
        <Service />
        <HowItWorks />
        <Awareness />
      </main>
      <Footer />
    </div>
  );
}