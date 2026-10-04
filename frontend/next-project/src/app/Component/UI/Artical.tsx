"use client";

import { Article } from "@/app/interface";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import CapitalLatter from "./CapitalLatter";

// 1. الاستماع لتغيرات الـ storage
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

// 2. قراءة القيمة في المتصفح (Client)
const getSnapshot = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role") === "awareness";
  }
  return false;
};

// 3. القيمة الافتراضية أثناء التجميع على السيرفر (SSR)
const getServerSnapshot = () => false;

function Artical({ article }: { article: Article }) {
  const router = useRouter();

  // قراءة آمنة وسريعة من localStorage بدون useEffect وبدون Cascading Renders
  const isAwareness = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(
        `http://localhost:8000/api/articles/${article.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Failed to delete, status:", res.status);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/health/edit/${article.id}`);
  };
  const handleCardClick = () => {
    router.push(`/health`);
  };
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-emerald-100/80 shadow-md hover:shadow-xl shadow-emerald-950/5 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between w-full h-full text-left overflow-hidden cursor-pointer min-h-[340px] sm:min-h-[380px]"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl" />

      <div className="flex flex-col gap-3 sm:gap-4 relative z-10">
        {/* الهيدر العلوي للكارت */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/60 shrink-0">
            <CapitalLatter text={article.category || "General"} />
          </span>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {formattedDate && (
              <span className="text-[11px] sm:text-xs font-medium text-slate-400 shrink-0">
                {formattedDate}
              </span>
            )}

            {isAwareness && (
              <div
                className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative group/tooltip">
                  <button
                    onClick={handleEdit}
                    type="button"
                    aria-label="Edit Article"
                    className="p-1.5 text-xs sm:text-sm text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    ✏️
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none z-30">
                    Edit Article
                  </span>
                </div>

                <div className="relative group/tooltip">
                  <button
                    onClick={handleDelete}
                    type="button"
                    aria-label="Delete Article"
                    className="p-1.5 text-xs sm:text-sm text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    🗑️
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none z-30">
                    Delete Article
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* عنوان المقال */}
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-200 leading-snug line-clamp-2 pt-1">
          {article.title}
        </h3>

        {/* محتوى المقال */}
        <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed font-normal line-clamp-3 sm:line-clamp-4">
          {article.content}
        </p>
      </div>

      {/* الفوتر */}
      <div className="pt-4 sm:pt-5 mt-4 sm:mt-6 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm relative z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 text-slate-600 font-medium min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            {article.author_name ? article.author_name.charAt(0).toUpperCase() : "✍️"}
          </div>
          <span className="truncate max-w-30 sm:max-w-40 font-semibold text-slate-700">
            <CapitalLatter text={article.author_name || "Health Team"} />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold group-hover:text-emerald-700 transition-colors shrink-0">
          <span>Read More</span>
          <span className="transform group-hover:translate-x-1 transition-transform duration-200">
            →
          </span>
        </div>
      </div>
    </div>
  );
}

export default Artical;