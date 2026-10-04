"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface Card1Props {
    img: string;
    head: string;
    text: string;
}

const data1: Array<Card1Props> = [
    {
        img: "/Img/Card11.jpg",
        head: "Professional Healthcare",
        text: "Providing trusted healthcare and nutritional support services with dedicated medical teams.",
    },
    {
        img: "/Img/Card12.jpg",
        head: "Organized Management",
        text: "Efficient beneficiary management, registration, and service tracking system.",
    },
    {
        img: "/Img/Card13.jpg",
        head: "Community Awareness",
        text: "Raising awareness through educational workshops and specialized health programs.",
    },
    {
        img: "/Img/Card14.jpg",
        head: "Humanitarian Support",
        text: "Supporting families and individuals in need with care, dignity, and continuous compassion.",
    },
];

function WhyChooseUs() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = Math.max(0, data1.length - itemsPerPage);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    return (
        <section className="py-8 sm:py-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 items-center relative z-10">

                {/* قسم العنوان والوصف النظيف */}
                <div className="w-full max-w-3xl text-center flex flex-col items-center gap-3">
                    <span className="text-emerald-700 text-xs sm:text-sm font-extrabold tracking-widest  bg-emerald-100/80 px-4 py-1.5 rounded-full border border-emerald-200">
                        Our Features
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight pt-1">
                        Why Choose <span className="text-emerald-600">Nabad Center </span>?
                    </h2>

                    <div className="w-16 h-1 bg-emerald-500 rounded-full my-1"></div>

                    <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                        We are dedicated to providing reliable healthcare and nutritional support services through organized management, community awareness, and genuine humanitarian assistance.
                    </p>
                </div>

                {/* حاوية الـ Carousel والأسهم الجانبية */}
                <div className="relative w-full pt-4">

                    {/* شريط الكروت التفاعلي بالانزلاق السلس */}
                    <div className="overflow-hidden rounded-3xl p-2">
                        <div
                            className="flex transition-transform duration-500 ease-out gap-6"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                            }}
                        >
                            {data1.map((item, index) => (
                                <div
                                    key={index}
                                    className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                                >
                                    <div className="group h-full bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md hover:shadow-xl shadow-emerald-900/5 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden">

                                        {/* صورة الكرت */}
                                        <div className="relative w-full h-48 sm:h-52 bg-slate-100 overflow-hidden">
                                            <Image
                                                src={item.img}
                                                alt={item.head}
                                                fill
                                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60"></div>
                                        </div>

                                        {/* محتوى الكرت */}
                                        <div className="p-6 flex flex-col gap-3 flex-grow">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                {item.head}
                                            </h3>
                                            <p className="text-slate-600 text-sm font-normal leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>

                                        {/* خط تجميلي سفلي عند الهوفر */}
                                        <div className="h-1 w-0 group-hover:w-full bg-emerald-500 transition-all duration-300"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* أزرار التنقل الجانبية الفاخرة */}
                    <button
                        onClick={handlePrev}
                        aria-label="Previous Slide"
                        className="absolute top-1/2 -left-3 sm:-left-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-emerald-600 text-slate-700 hover:text-white shadow-lg border border-slate-200/80 hover:border-emerald-600 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                    >
                        ←
                    </button>

                    <button
                        onClick={handleNext}
                        aria-label="Next Slide"
                        className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-emerald-600 text-slate-700 hover:text-white shadow-lg border border-slate-200/80 hover:border-emerald-600 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                    >
                        →
                    </button>

                </div>

                {/* مؤشرات النقاط التفاعلية (Pagination Dots) */}
                <div className="flex items-center gap-2 pt-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx
                                ? "w-8 bg-emerald-600"
                                : "w-2.5 bg-emerald-200 hover:bg-emerald-300"
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}

export default WhyChooseUs;