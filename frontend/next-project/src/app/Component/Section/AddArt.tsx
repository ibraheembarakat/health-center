"use client";

import { useState } from "react";

function AddArt() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        const token = localStorage.getItem("accessToken");

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/api/articles/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        category,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // طباعة الاستجابة الدقيقة القادمة من الـ API لمعرفة السبب
                console.error("❌ SERVER RESPONDED WITH ERROR:", data);

                // تحويل الكائن لرسالة مفهومة للعرض
                const errorText =
                    typeof data === "object" ? JSON.stringify(data) : data?.detail || "Failed to add article";
                throw new Error(errorText);
            }

            setStatusMessage({
                type: "success",
                text: "Article published successfully!",
            });

            setTitle("");
            setContent("");
            setCategory("");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            console.error("Catch error:", error);
            setStatusMessage({
                type: "error",
                text: error?.message || "Could not publish the article.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full my-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-linear-to-br from-teal-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-800/40 text-white relative overflow-hidden">

                <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col items-center text-center gap-2 mb-8">
                        <span className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-md">
                            ✨
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Create New Article
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/70 max-w-md">
                            Share health awareness insights with the centers visitors
                        </p>
                    </div>

                    {statusMessage && (
                        <div
                            className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all break-words ${statusMessage.type === "success"
                                ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                                : "bg-rose-500/20 border border-rose-400/40 text-rose-200"
                                }`}
                        >
                            <span>{statusMessage.type === "success" ? "✅" : "⚠️"}</span>
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>📌</span> Article Title
                            </label>
                            <input
                                type="text"
                                placeholder="Enter article title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/10 border border-white/15 focus:border-emerald-400 focus:bg-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-slate-400 text-sm font-medium transition-all outline-none backdrop-blur-md"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>🏷️</span> Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-900/90 border border-white/15 focus:border-emerald-400 rounded-2xl px-4 py-3.5 text-white text-sm font-medium transition-all outline-none cursor-pointer appearance-none"
                                    required
                                >
                                    <option value="" disabled className="text-slate-400">
                                        Choose category
                                    </option>
                                    <option value="nutrition">Nutrition</option>
                                    <option value="health">Health</option>
                                    <option value="children">Children</option>
                                    <option value="pregnancy">Pregnancy</option>
                                    <option value="chronic_diseases">Chronic Diseases</option>
                                    <option value="awareness">Awareness</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-xs">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>📝</span> Article Content
                            </label>
                            <textarea
                                placeholder="Write the article body here (more than 20 characters)..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full bg-white/10 border border-white/15 focus:border-emerald-400 focus:bg-white/15 rounded-2xl px-4 py-3.5 text-white placeholder-slate-400 text-sm font-medium transition-all outline-none resize-none backdrop-blur-md"
                                required
                                minLength={20}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Publish Article</span>
                                    <span>🚀</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddArt;