import HeaderSection from "../UI/HeaderSection";

interface StepItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

const steps: StepItem[] = [
  {
    id: "01",
    title: "Registration Request",
    desc: "Beneficiaries are registered and their information is securely stored in the system.",
    icon: "📋",
  },
  {
    id: "02",
    title: "Eligibility & Medical Assessment",
    desc: "Staff members verify eligibility and perform the required health and nutritional assessments.",
    icon: "🔍",
  },
  {
    id: "03",
    title: "Approval & Follow-Up",
    desc: "Eligible beneficiaries are approved and continuously monitored through the system.",
    icon: "✅",
  },
  {
    id: "04",
    title: "Assistance Delivery & Notifications",
    desc: "Beneficiaries receive notifications and assistance according to the scheduled process.",
    icon: "📦",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 sm:py-12 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-14 items-center relative overflow-hidden">
      
      {/* لمسة ديكور ضبابية خلف القسم */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* استخدام المكون الموحد HeaderSection */}
      <HeaderSection
        badge="WORKFLOW"
        head="How It Works"
        text="Our platform follows a clear and organized workflow to ensure accurate registration, proper assessment, and efficient delivery of healthcare and support services."
      />

      {/* بطاقات الخطوات المتسلسلة (4 خطوات) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-7 border border-emerald-100/80 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between h-full"
          >
            {/* شريط توهج علوي عند الهوفر */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

            <div className="flex flex-col gap-4">
              {/* الجزء العلوي: الرقم والأيقونة */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-emerald-200 group-hover:text-emerald-500 transition-colors duration-300">
                  {step.id}
                </span>
              </div>

              {/* عنوان الخطوة */}
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors duration-200 leading-snug pt-2">
                {step.title}
              </h3>

              {/* وصف الخطوة */}
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>

            {/* سهم مؤشر بين الخطوات (يختفي في الأخيرة) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-emerald-300 group-hover:text-emerald-500 transition-colors">
                ➔
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  );
}

export default HowItWorks;