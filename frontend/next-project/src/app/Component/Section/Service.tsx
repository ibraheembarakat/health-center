import Card1, { Card1Props } from "../UI/Card1";
import HeaderSection from "../UI/HeaderSection";

const data1: Array<Card1Props> = [
  {
    head: "Beneficiary Registration",
    text: "Securely register new beneficiaries and store their personal and health data.",
  },
  {
    head: "Eligibility Verification",
    text: "Evaluate and verify eligibility based on health and nutritional criteria.",
  },
  {
    head: "Medical Assessment Records",
    text: "Store and manage medical assessment results for each beneficiary.",
  },
  {
    head: "Complaint Management System",
    text: "Receive, track, and respond to user complaints efficiently.",
  },
  {
    head: "Awareness Content Management",
    text: "Create, update, and manage health awareness articles and content.",
  },
  {
    head: "Assistance Distribution Tracking",
    text: "Track and manage monthly assistance distribution to ensure fair and organized delivery.",
  },
];

function Service() {
  return (
    <section id="service" className="py-8 sm:py-12 px-4 sm:px-8 lg:px-12 w-full max-w-350 mx-auto flex flex-col gap-12 items-center">
            <HeaderSection
        badge="SERVICES"
        head="Our Services"
        text="We provide a structured set of healthcare and support services that ensure efficient management of beneficiaries, accurate assessment, and continuous care within a unified system. Our services include:"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 w-full max-lg:flex max-lg:flex-col max-lg:items-center">
        {data1.map((item, index) => (
          <Card1 props={item} key={index} />
        ))}
      </div>

    </section>
  );
}

export default Service;