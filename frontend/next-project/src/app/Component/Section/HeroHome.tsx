import Image from "next/image";
import Link from "next/link";

function HeroHome() {
    return (
        <section className="relative py-12 lg:py-20 bg-linear-to-br from-emerald-50/80 via-slate-50 to-teal-50/60 overflow-hidden border-b border-emerald-100/60">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    <div className="lg:col-span-6 flex justify-center">
                        <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl p-3 bg-white/80 backdrop-blur-sm border-2 border-emerald-200/80 shadow-xl shadow-emerald-900/5">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                                <Image
                                    src="/Img/HeroPhoto.jpg"
                                    alt="Healthcare Support"
                                    fill
                                    priority
                                    className="object-cover object-center transform transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300/80 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Nabad Center for Nutritional Support
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                            Empowering Communities Through{" "}
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                                Care & Support
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                            A modern platform for managing healthcare services, assistance programs, and beneficiary support with high efficiency.
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full">
                            <Link
                                href="/#service"
                                className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all duration-200"
                            >
                                Explore Services
                            </Link>
                            <Link
                                href="/login"
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 font-bold text-sm border-2 border-emerald-600/20 shadow-sm transition-all duration-200"
                            >
                                Join Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroHome;