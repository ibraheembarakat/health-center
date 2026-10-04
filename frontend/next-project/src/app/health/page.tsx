"use client";

import { useEffect, useState, useMemo } from "react";
import { ApiResponse, Article } from "../interface";
import Artical from "../Component/UI/Artical";
import Navbar from "../Component/layout/Navbar";
import Image from "next/image";
import Footer from "../Component/layout/Footer";

const data1: Array<string> = [
    "/Img/baby1.jpg",
    "/Img/baby2.jpg",
    "/Img/baby3.png",
    "/Img/baby4.png",
    "/Img/baby5.jpg",
    "/Img/baby6.jpg",
    "/Img/baby7.jpg",
    "/Img/baby8.jpg",
    "/Img/baby9.jpg",
];

const API_URL = "http://localhost:8000/api/articles/";

export default function HealthPage() {
    const [startIndex, setStartIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);
    const [buttonSee, setButtonSee] = useState(false);

    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFiltering, setIsFiltering] = useState(false);

    // التحكم بالتجاوب الخاص بسلايدر الصور
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setCardsPerView(1);
                setButtonSee(true);
            } else if (width < 1024) {
                setCardsPerView(2);
                setButtonSee(true);
            } else {
                setCardsPerView(3);
                setButtonSee(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const total = data1.length;
    const handleNext = () => setStartIndex((prev) => (prev + 1) % total);
    const handlePrev = () => setStartIndex((prev) => (prev - 1 + total) % total);

    const visibleCards = useMemo(() => {
        const cards = [];
        for (let i = 0; i < cardsPerView; i++) {
            cards.push(data1[(startIndex + i) % total]);
        }
        return cards;
    }, [startIndex, cardsPerView, total]);

    // 1. جلب المقالات من السيرفر
    useEffect(() => {
        const getArticles = async () => {
            try {
                const res = await fetch(API_URL, {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status}`);
                }

                const data: ApiResponse = await res.json();
                setArticles(data.results || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        getArticles();
    }, []);

    // 2. استخراج الأقسام ديناميكياً من المقالات
    const dynamicCategories = useMemo(() => {
        const categoriesSet = new Set<string>();

        articles.forEach((article) => {
            if (article.category) {
                categoriesSet.add(article.category.trim());
            }
        });

        return ["all", ...Array.from(categoriesSet)];
    }, [articles]);

    const handleCategoryChange = (catName: string) => {
        if (catName === selectedCategory) return;
        setIsFiltering(true);
        setTimeout(() => {
            setSelectedCategory(catName);
            setIsFiltering(false);
        }, 200);
    };

    // 3. تصفية المقالات
    const filteredArticles = useMemo(() => {
        if (selectedCategory === "all") return articles;
        return articles.filter(
            (article) =>
                article.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
    }, [articles, selectedCategory]);

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between overflow-x-hidden">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex flex-col gap-8 sm:gap-12">
                {/* هيدر الصفحة والفلترة */}
                <div className="flex flex-col items-center text-center gap-4 sm:gap-6 w-full">
                    <div className="space-y-2 max-w-2xl flex flex-col gap-1 sm:gap-2 items-center px-2">
                        <span className="text-emerald-600 font-bold tracking-widest text-[10px] sm:text-xs uppercase bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200 w-fit">
                            Health & Wellness Center
                        </span>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Educational Health Articles
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-xl">
                            Explore trusted medical insights and advice provided by specialized awareness teams.
                        </p>
                    </div>

                    {/* شريط الأقسام التفاعلي المتجاوب (تم التعديل لضمان السكرول بدون حزف) */}
                    {dynamicCategories.length > 1 && (
                        <div className="w-full max-w-full overflow-x-auto scrollbar-none py-2 px-1">
                            <div className="inline-flex min-w-full sm:w-auto items-center justify-start sm:justify-center gap-1.5 sm:gap-2 bg-white/80 p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 shadow-xs backdrop-blur-md w-max">
                                {dynamicCategories.map((catName) => {
                                    const isActive = selectedCategory === catName;
                                    const count =
                                        catName === "all"
                                            ? articles.length
                                            : articles.filter(
                                                (a) => a.category?.toLowerCase() === catName.toLowerCase()
                                            ).length;

                                    return (
                                        <button
                                            key={catName}
                                            onClick={() => handleCategoryChange(catName)}
                                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 relative capitalize whitespace-nowrap shrink-0 ${isActive
                                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102 sm:scale-105"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                                                }`}
                                        >
                                            <span>{catName === "all" ? "All Articles" : catName}</span>
                                            <span
                                                className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full ${isActive
                                                        ? "bg-emerald-700 text-emerald-100"
                                                        : "bg-slate-200/80 text-slate-600"
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* عرض المقالات متجاوب (Grid System) */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium text-xs sm:text-sm">
                            Loading latest articles...
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 sm:p-6 rounded-2xl text-center max-w-lg mx-auto w-full">
                        <p className="font-bold text-sm sm:text-base">Failed to load content</p>
                        <p className="text-xs mt-1 text-rose-600">{error}</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-3xl border border-slate-200/60 shadow-xs text-center max-w-md mx-auto w-full">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-3">
                            🍃
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                            No Articles Found
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                            There are currently no articles published in this category.
                        </p>
                    </div>
                ) : (
                    /* Grid للتكيّف مع كل أحجام الشاشات */
                    <div
                        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 transition-all duration-300 ${isFiltering
                                ? "opacity-0 translate-y-2 scale-98"
                                : "opacity-100 translate-y-0 scale-100"
                            }`}
                    >
                        {filteredArticles.map((article) => (
                            <div key={article.id} className="w-full flex justify-center">
                                <Artical article={article} />
                            </div>
                        ))}
                    </div>
                )}

                {/* معرض الصور السفلية (Responsive Carousel) */}
                <section className="mt-6 sm:mt-10 border-t border-slate-200/80 pt-8 sm:pt-12 flex flex-col gap-6 sm:gap-8">
                    <div className="text-center px-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                            Community & Health Activities
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Highlights from our recent child care and awareness events
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
                        {!buttonSee && (
                            <button
                                onClick={handlePrev}
                                aria-label="Previous image"
                                className="w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center border border-slate-200 rounded-2xl text-base sm:text-lg bg-white shadow-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                            >
                                ←
                            </button>
                        )}

                        <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-hidden py-2 w-full max-w-4xl">
                            {visibleCards.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-[260px] aspect-square shrink-0"
                                >
                                    <Image
                                        src={item}
                                        alt="Health Event"
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>

                        {!buttonSee && (
                            <button
                                onClick={handleNext}
                                aria-label="Next image"
                                className="w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center border border-slate-200 rounded-2xl text-base sm:text-lg bg-white shadow-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                            >
                                →
                            </button>
                        )}
                    </div>

                    {buttonSee && (
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handlePrev}
                                aria-label="Previous image"
                                className="w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center border border-slate-200 rounded-2xl text-base sm:text-lg bg-white shadow-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 active:scale-95"
                            >
                                ←
                            </button>
                            <button
                                onClick={handleNext}
                                aria-label="Next image"
                                className="w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center border border-slate-200 rounded-2xl text-base sm:text-lg bg-white shadow-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 active:scale-95"
                            >
                                →
                            </button>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}