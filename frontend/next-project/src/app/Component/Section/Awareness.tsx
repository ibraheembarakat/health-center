'use client'
import { useEffect, useState } from "react"
import HeaderSection from "../UI/HeaderSection"
import { ApiResponse, Article } from "@/app/interface"
import Artical from "../UI/Artical"

const API_URL = "http://localhost:8000/api/articles/";

function Awareness() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const chronicArticles = articles.filter(
        (article) => article.category === "chronic_diseases"
    );
    return (
        <section id="awareness" className="py-8 sm:py-12 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto flex flex-col gap-12 items-center relative overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-150 h-75 bg-emerald-100/30 blur-3xl rounded-full pointer-events-none -z-10" />
            <HeaderSection
                badge="HEALTH EDUCATION"
                head="Health Awareness"
                text="Raising awareness about maternal and child healthcare helps families build healthier lives and safer futures for their children."
            />
            <div className="w-full max-w-5xl">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60" />
                        ))}
                    </div>
                ) : error ? (
                    /* حالة الخطأ */
                    <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl max-w-md mx-auto">
                        <p className="font-semibold">Failed to load articles</p>
                        <p className="text-sm text-rose-500 mt-1">{error}</p>
                    </div>
                ) : (
                    /* عرض الكروت */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {chronicArticles.map((article) => (
                            <Artical article={article} key={article.id} />
                        ))}
                    </div>
                )}
            </div>


        </section>
    );
}

export default Awareness;