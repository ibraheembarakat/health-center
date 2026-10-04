import HeaderSection from "../UI/HeaderSection";
import CardNumber from "../UI/CardNumber";

const nums = [
    {
        number: "+7,000",
        text: "Beneficiaries Supported",
        icon: "👥",
    },
    {
        number: "+17,000",
        text: "Assistance Provided",
        icon: "🤝",
    },
    {
        number: "+500",
        text: "Awareness Sessions",
        icon: "💡",
    },
    {
        number: "+9,000",
        text: "Medical Assessments",
        icon: "🩺",
    },
];

function About() {
    return (
        <section id="about" className="py-16 lg:py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 items-center relative z-10">

                <HeaderSection
                    badge="Who We Are"
                    head="About Nabad Association"
                    text="Nabad Association is a specialized healthcare and nutritional support center dedicated to helping children, mothers, and vulnerable families through structured medical services, community awareness programs, and humanitarian assistance."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4">
                    {nums.map((item, index) => (
                        <CardNumber key={index} {...item} />
                    ))}
                </div>

            </div>
        </section>
    );
}

export default About;