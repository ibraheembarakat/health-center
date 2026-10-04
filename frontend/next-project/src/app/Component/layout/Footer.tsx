import Image from "next/image";
import Link from "next/link";

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 relative overflow-hidden border-t border-slate-800 rounded-lg">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-16 pb-12 relative z-10">
                {/* شبكة محتويات الفوتر */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
                    {/* العمود الأول: الشعار والوصف (يأخذ مساحة أكبر) */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <Image
                                    src="/Img/Logo.png"
                                    alt="Nabad Association"
                                    width={140}
                                    height={45}
                                    className="object-contain rounded-lg"
                                />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                Nabad <span className="text-emerald-400">Association</span>
                            </h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Providing healthcare, nutritional support, and awareness
                            services for children, mothers, and families in need through
                            organized and professional care.
                        </p>
                        {/* أزرار وسائل التواصل (اختياري) */}
                        <div className="flex items-center gap-3 pt-2">
                            <span className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all cursor-pointer">
                                🌐
                            </span>
                            <span className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all cursor-pointer">
                                ✉️
                            </span>
                            <span className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all cursor-pointer">
                                📞
                            </span>
                        </div>
                    </div>
                    {/* العمود الثاني: Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5 text-sm font-medium">
                            {[
                                { name: "Home", href: "/" },
                                { name: "About Us", href: "#about" },
                                { name: "Services", href: "#service" },
                                { name: "Awareness", href: "#awareness" },
                                { name: "How It Works", href: "#how-it-works" },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1 group"
                                    >
                                        <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            ›
                                        </span>
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* العمود الثالث: Our Services */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">
                            Our Services
                        </h3>
                        <ul className="space-y-2.5 text-sm font-medium text-slate-400">
                            <li className="hover:text-slate-200 transition-colors cursor-default">
                                Beneficiary Registration
                            </li>
                            <li className="hover:text-slate-200 transition-colors cursor-default">
                                Medical Assessments
                            </li>
                            <li className="hover:text-slate-200 transition-colors cursor-default">
                                Awareness Programs
                            </li>
                            <li className="hover:text-slate-200 transition-colors cursor-default">
                                Complaint Management
                            </li>
                            <li className="hover:text-slate-200 transition-colors cursor-default">
                                Assistance Tracking
                            </li>
                        </ul>
                    </div>
                    {/* العمود الرابع: Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400">
                            Contact Us
                        </h3>
                        <div className="space-y-3 text-sm font-medium text-slate-400">
                            <div className="flex items-start gap-3">
                                <span className="text-emerald-400">📍</span>
                                <span>Syria, Latakia</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-emerald-400">📞</span>
                                <span className="hover:text-white transition-colors">
                                    +963 999 999 999
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-emerald-400">✉️</span>
                                <span className="hover:text-white transition-colors">
                                    info@nabad.org
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* السطر السفلي للحقوق */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
                    <p>© 2026 Nabad Association. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-400 transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-slate-400 transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;